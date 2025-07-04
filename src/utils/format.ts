import { Song } from "../types/spicetify-history";

/**
 * Converts a duration from milliseconds to a "MM:SS" format string.
 * @param ms - Duration in milliseconds.
 * @returns A string in the format "minutes:seconds".
 */
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
};

/**
 * Formats a timestamp into either a relative time string (e.g. "5 mins ago")
 * or an absolute date string (e.g. "13:05 / 07 / 02 / 25") depending on whether
 * the date is finalized.
 *
 * @param timestamp - The timestamp to format (milliseconds since epoch).
 * @param isFinalized - Whether the date is finalized or should use relative formatting.
 * @returns A human-readable formatted date string.
 */
const formatDate = (timestamp: number, isFinalized: boolean): string => {
  const date = new Date(timestamp);

  if (!isFinalized) {
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Check for yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }
  }

  // Finalized: format as "HH:mm / MM / DD / YY"
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${h}:${m} / ${month} / ${day} / ${year}`;
};

/**
 * Determines whether a given timestamp is older than one day.
 * @param timestamp - Timestamp in milliseconds since epoch.
 * @returns True if the timestamp is older than one day, false otherwise.
 */
const isOlderThanOneDay = (timestamp: number): boolean => {
  const now = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(now.getDate() - 1);

  return timestamp < oneDayAgo.getTime();
};

/**
 * Handles the formatting of a song's listen date.
 * Decides whether to show a relative date ("5 mins ago") or an absolute one,
 * depending on if it's finalized or older than a day.
 *
 * @param song - The song whose listen date is being formatted.
 * @returns A formatted string representation of the song's listen date.
 */
const handleSongDate = (song: Song): string => {
  const isFinalized = isOlderThanOneDay(song.listenDate) || song.dateFinalized;
  return formatDate(song.listenDate, isFinalized);
};

/**
 * Computes the total duration of an album (sum of all song durations).
 * @param songs - The array of songs in the album.
 * @returns Total duration in milliseconds.
 */
const totalAlbumDuration = (songs: Song[]): number =>
  songs.reduce((sum, song) => sum + song.duration.milliseconds, 0);

export {
  formatDuration,
  formatDate,
  handleSongDate,
  isOlderThanOneDay,
  totalAlbumDuration,
};
