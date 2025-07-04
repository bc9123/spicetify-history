import { useEffect, useRef } from "react";

/**
 * Custom hook that tracks the currently playing song in the Spotify player.
 *
 * It listens for changes to the Spotify player's playback state (play/pause)
 * and track changes (songchange), and updates internal refs with the
 * current track's UID and URI.
 *
 * @param onSongChange - Callback function to invoke when a new song starts playing
 *                       or playback state changes.
 * @returns Object with `currentPlayingUid` and `currentPlayingUri` refs.
 */
export function usePlayerTracking(onSongChange: () => void) {
  // Ref to hold the UID of the currently playing song
  const currentPlayingUid = useRef<string | null>(null);

  // Ref to hold the URI of the currently playing song
  const currentPlayingUri = useRef<string | null>(null);

  useEffect(() => {
    /**
     * Event handler triggered on "play/pause" or "songchange" events.
     * Calls the user-defined `onSongChange` callback and updates refs
     * with the current song’s URI and UID (if available).
     */
    const handler = () => {
      onSongChange();

      const currentItem = Spicetify.Player.data?.item;

      if (currentItem && currentItem.type === "track") {
        currentPlayingUri.current = currentItem.uri;
        currentPlayingUid.current = currentItem.uid;
      }
    };

    // Attach event listeners to the Spotify player
    Spicetify.Player.addEventListener("onplaypause", handler);
    Spicetify.Player.addEventListener("songchange", handler);

    // Cleanup event listeners on unmount
    return () => {
      Spicetify.Player.removeEventListener("onplaypause", handler);
      Spicetify.Player.removeEventListener("songchange", handler);
    };
  }, [onSongChange]);

  return {
    currentPlayingUid,
    currentPlayingUri,
  };
}
