import { Song } from "../types/spicetify-history";

/**
 * Hook that determines how songs should be displayed based on the current display mode.
 *
 * If in "song" mode, it slices the song list for infinite scroll or pagination.
 * If in "album" mode, it groups songs by album and sorts them according to the provided config.
 *
 * @param songs - The complete list of songs to display
 * @param visibleCount - Number of songs to display (used for infinite scroll)
 * @param displayedHistoryType - Whether the display mode is "song" or "album"
 * @param albumSortConfig - Sort configuration to apply when displaying albums
 *
 * @returns A flat array of songs or a map of albumId to grouped songs, depending on the mode
 */
export const useDisplayedSongs = (
  songs: Song[],
  visibleCount: number,
  displayedHistoryType: "song" | "album",
  albumSortConfig: { key: string; ascending: boolean }
): Song[] | Record<string, Song[]> => {
  // If viewing as individual songs, return a sliced list for pagination/infinite scroll
  if (displayedHistoryType === "song") {
    return songs.slice(0, visibleCount);
  }

  // Group songs by album ID
  const albumMap: Record<string, Song[]> = {};
  for (const song of songs) {
    const albumId = song.album?.uri;
    if (!albumId) continue;

    if (!albumMap[albumId]) {
      albumMap[albumId] = [];
    }
    albumMap[albumId].push(song);
  }

  // Sort albums based on the specified sort key
  const sortedAlbums = Object.entries(albumMap).sort(([_, aSongs], [__, bSongs]) => {
    const a = aSongs[0]; // Representative song for album A
    const b = bSongs[0]; // Representative song for album B

    switch (albumSortConfig.key) {
      case "name":
        return (a.album?.name || "").localeCompare(b.album?.name || "");

      case "listenDate":
        return a.listenDate - b.listenDate;

      case "duration": {
        const aTotal = aSongs.reduce((sum, s) => sum + s.duration.milliseconds, 0);
        const bTotal = bSongs.reduce((sum, s) => sum + s.duration.milliseconds, 0);
        return aTotal - bTotal;
      }

      case "songCount":
        return aSongs.length - bSongs.length;

      default:
        return 0;
    }
  });

  // Reverse the result if sorting in descending order
  if (!albumSortConfig.ascending) {
    sortedAlbums.reverse();
  }

  // Reconstruct the sorted album map
  const sortedAlbumMap: Record<string, Song[]> = {};
  for (const [id, songs] of sortedAlbums) {
    sortedAlbumMap[id] = songs;
  }

  return sortedAlbumMap;
};
