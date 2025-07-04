import { HandlePlayPauseSongProps } from "../types/spicetify-history";

/**
 * Handles play/pause logic for a song.
 * 
 * - If the selected song is currently playing, it toggles play/pause.
 * - If it's a different song, it starts playing that song and updates the current playing references.
 * 
 * @param songUri - The URI of the selected song.
 * @param songUid - The UID of the selected song (used to match against current playback).
 * @param currentPlayingUri - Ref to the currently playing song's URI.
 * @param currentPlayingUid - Ref to the currently playing song's UID.
 */
export const handlePlayPauseSong = ({
  songUri,
  songUid,
  currentPlayingUri,
  currentPlayingUid,
}: HandlePlayPauseSongProps): void => {
  if (!Spicetify?.Player) return;

  const isSameSong = songUri === currentPlayingUri.current;

  if (isSameSong) {
    // Toggle pause/play if the same song is selected
    if (Spicetify.Player.isPlaying()) {
      Spicetify.Player.pause();
    } else {
      Spicetify.Player.play();
    }
  } else {
    // Play new song and update refs
    Spicetify.Player.playUri(songUri).then(() => {
      currentPlayingUri.current = songUri;
      currentPlayingUid.current = songUid;
    });
  }
};
