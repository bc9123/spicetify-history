// src/hooks/useSort.ts
import { useState } from "react";

/**
 * A reusable hook for managing sorting logic for two distinct contexts:
 * - Song-level sorting (e.g., song name, duration, listen date)
 * - Album-level sorting (e.g., album name, total song count, representative track)
 *
 * @template T Type of data being sorted (e.g., Song)
 * @param initialKey The initial sort key (e.g., 'listenDate')
 * @param initialAsc Whether to sort in ascending order initially
 * @returns Object containing sort configs and functions for both song and album types
 */
export const useSort = <T>(initialKey: keyof T, initialAsc = false) => {
  // Sorting config for songs
  const [songSortConfig, setSongSortConfig] = useState<{ key: keyof T; ascending: boolean }>({
    key: initialKey,
    ascending: initialAsc,
  });

  // Sorting config for albums (same structure, different behavior)
  const [albumSortConfig, setAlbumSortConfig] = useState<{ key: keyof T | "songCount"; ascending: boolean }>({
    key: initialKey,
    ascending: initialAsc,
  });

  /**
   * Updates song sort config. If the same key is selected again, it toggles the sort direction.
   * @param key A key of the data object to sort by (e.g., 'name', 'duration')
   */
  const songSortBy = (key: keyof T) => {
    setSongSortConfig((prev) => ({
      key,
      ascending: prev.key === key ? !prev.ascending : true,
    }));
  };

  /**
   * Updates album sort config. Accepts both normal keys and "songCount".
   * @param key The album sort key (can be 'songCount' or any keyof T)
   */
  const albumSortBy = (key: keyof T | "songCount") => {
    setAlbumSortConfig((prev) => ({
      key,
      ascending: prev.key === key ? !prev.ascending : true,
    }));
  };

  return {
    songSortConfig,
    songSortBy,
    albumSortConfig,
    albumSortBy,
  };
};
