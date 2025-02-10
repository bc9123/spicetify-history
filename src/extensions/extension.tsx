// Listens for song changes and stores track details in IndexedDB.
import { Song } from "../db";
import { openDB, saveSongToDB } from "../db";

(async () => {
  while (!Spicetify?.showNotification && Spicetify) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const db = await openDB();
  let currentSong: Song | null = null;

  Spicetify.Player.addEventListener("songchange", async () => {
    const song = Spicetify.Player.data?.item;

    if (song && song.type === "track") {

      const artists = song.artists?.map(artist => ({
        name: artist.name,
        uri: artist.uri
      })) || [];

      const images = song.images?.map(image => ({
        label: image.label,
        url: image.url,
      })) || [];

      currentSong = {
        uid: song.uid,
        uri: song.uri,
        name: song.name,
        duration: song.duration,
        album: {
          uri: song.album?.uri,
          name: song.album?.name,
        },
        artists: artists,
        metadata: song.metadata,
        images: images,
        listenDate: new Date().getTime(),
      };

      try {
        await saveSongToDB(db, currentSong);
        console.log("Song saved:", currentSong.name);
      } catch (error) {
        console.error("Failed to save song:", error);
      }
    }
  });
})();
