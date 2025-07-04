import { Song } from "../types/spicetify-history";

/**
 * Sorts a list of songs based on the given configuration.
 *
 * @param songs - The array of songs to sort.
 * @param sortConfig - Configuration object containing:
 *   - `key`: The key to sort by (e.g., "name", "album", etc.).
 *   - `ascending`: Whether to sort in ascending (true) or descending (false) order.
 * @returns A new sorted array of songs.
 */
export const sortSongs = (
  songs: Song[],
  sortConfig: { key: string; ascending: boolean }
): Song[] => {
  const sortedSongs = [...songs].sort((a, b) => {
    switch (sortConfig.key) {
      case "name":
        return a.name.localeCompare(b.name);
      case "album":
        return (a.album?.name || "").localeCompare(b.album?.name || "");
      case "listenDate":
        return a.listenDate - b.listenDate;
      case "duration":
        return a.duration.milliseconds - b.duration.milliseconds;
      default:
        return 0;
    }
  });

  return sortConfig.ascending ? sortedSongs : sortedSongs.reverse();
};

/**
 * Sorts a grouped set of songs by album, based on album-level metadata.
 *
 * @param albums - A map of albumId to an array of songs belonging to that album.
 * @param sortKey - The album-level property to sort by:
 *   - "album": Sort by album name.
 *   - "name": Sort by the representative song name.
 *   - "listenDate": Sort by the earliest listen date in the album.
 *   - "duration": Sort by total album duration.
 *   - "songCount": Sort by number of songs in the album.
 * @param ascending - Whether to sort in ascending order.
 * @returns An array of [albumId, songs[]] pairs, sorted accordingly.
 */
export const sortAlbums = (
  albums: Record<string, Song[]>,
  sortKey: "album" | "name" | "listenDate" | "duration" | "songCount",
  ascending: boolean
): [string, Song[]][] => {
  const entries = Object.entries(albums);

  const sorted = entries.sort(([, songsA], [, songsB]) => {
    const a = songsA[0];
    const b = songsB[0];

    switch (sortKey) {
      case "album":
        return a.album.name.localeCompare(b.album.name);
      case "name":
        return a.name.localeCompare(b.name);
      case "listenDate":
        return a.listenDate - b.listenDate;
      case "duration": {
        const totalA = songsA.reduce((sum, s) => sum + s.duration.milliseconds, 0);
        const totalB = songsB.reduce((sum, s) => sum + s.duration.milliseconds, 0);
        return totalA - totalB;
      }
      case "songCount":
        return songsA.length - songsB.length;
      default:
        return 0;
    }
  });

  return ascending ? sorted : sorted.reverse();
};
