import { useState, useRef, useEffect } from "react";
import { Song } from "../types/spicetify-history";

/**
 * Hook for handling debounced search filtering over a list of songs.
 *
 * This allows smooth and efficient filtering of the song list as the user types,
 * without re-filtering the list on every keystroke (thanks to a 300ms debounce delay).
 *
 * @param songs - The full list of songs to filter
 *
 * @returns An object containing:
 *   - `searchQuery`: Current value of the search input
 *   - `setSearchQuery`: Setter to update the search query
 *   - `filteredSongs`: Songs matching the search query
 */
export function useDebouncedSearch(songs: Song[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredSongs, setFilteredSongs] = useState<Song[]>(songs);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout if the query or song list changes
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set a new debounce timeout
    debounceRef.current = setTimeout(() => {
      const query = searchQuery.toLowerCase();

      // Filter by name, album name, or any artist name
      const filtered = songs.filter((song) =>
        song.name.toLowerCase().includes(query) ||
        song.album?.name?.toLowerCase().includes(query) ||
        song.artists?.some((artist) =>
          artist.name.toLowerCase().includes(query)
        )
      );

      setFilteredSongs(filtered);
    }, 300); // 300ms debounce

    // Cleanup function in case component unmounts or query changes before timeout completes
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, songs]);

  return { searchQuery, setSearchQuery, filteredSongs };
}
