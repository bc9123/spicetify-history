import { useEffect, useState, useCallback } from "react";
import {
  openDB,
  getHistoryFromDB,
  clearHistoryFromDB,
  deleteSongFromDB,
  exportHistoryAsFile,
  importHistoryAsFile,
} from "../db";
import { sort } from "../utils/utils";
import { Song } from "../types/spicetify-history";

/**
 * Custom hook to manage Spotify listening history using IndexedDB.
 * It provides methods to interact with the local song database, such as
 * fetching, sorting, clearing, deleting, exporting, and importing history.
 *
 * @param sortConfig - Configuration object specifying sorting key and direction.
 * @returns An object containing:
 *   - db: The open IndexedDB instance
 *   - songs: The current list of songs from the database
 *   - setSongs: Manually update the song list (if needed)
 *   - fetchHistory: Fetch and sort song history
 *   - handleClearHistory: Clear all stored songs
 *   - handleDeleteSong: Delete a specific song by UID
 *   - handleExportHistory: Export song history to a JSON file
 *   - handleImportHistory: Import song history from a JSON file
 */
export const useHistoryDB = (sortConfig: { key: string; ascending: boolean }) => {
  const [db, setDb] = useState<IDBDatabase | undefined>(undefined);
  const [songs, setSongs] = useState<Song[]>([]);

  /**
   * Initializes and opens the IndexedDB database once on mount.
   */
  useEffect(() => {
    (async () => {
      try {
        const database = await openDB();
        setDb(database);
      } catch (error) {
        console.error("Failed to open DB:", error);
      }
    })();
  }, []);

  /**
   * Fetches the listening history from the database and sorts it
   * according to the provided sort configuration.
   */
  const fetchHistory = useCallback(async () => {
    if (!db) return;
    try {
      const songsFromDB = await getHistoryFromDB(db);
      const sortedSongs = sort.sortSongs(songsFromDB, sortConfig);
      setSongs(sortedSongs);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, [db, sortConfig]);

  // Automatically fetch history when the DB or sorting changes.
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Clears the entire history from the database.
   */
  const handleClearHistory = useCallback(async () => {
    if (!db) return;
    try {
      await clearHistoryFromDB(db);
      await fetchHistory();
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, [db, fetchHistory]);

  /**
   * Deletes a specific song from the database by UID.
   * @param uid - The UID of the song to delete
   */
  const handleDeleteSong = useCallback(async (uid: string) => {
    if (!db) return;
    try {
      await deleteSongFromDB(db, uid);
      await fetchHistory();
    } catch (error) {
      console.error("Failed to delete song:", error);
    }
  }, [db, fetchHistory]);

  /**
   * Exports the entire song history to a JSON file.
   */
  const handleExportHistory = useCallback(async () => {
    if (!db) return;
    try {
      await exportHistoryAsFile(db);
    } catch (error) {
      console.error("Failed to export history:", error);
    }
  }, [db]);

  /**
   * Imports song history from a JSON file.
   * Updates the song list afterward and hides the modal.
   * @param file - The uploaded file containing song data
   */
  const handleImportHistory = useCallback(
    async (file: File) => {
      if (!db) {
        Spicetify.showNotification("Database not ready");
        return;
      }
      try {
        await importHistoryAsFile(db, file);
        await fetchHistory();
        Spicetify.PopupModal.hide();
      } catch (error) {
        console.error("Failed to import history:", error);
      }
    },
    [db, fetchHistory]
  );

  return {
    db,
    songs,
    setSongs,
    fetchHistory,
    handleClearHistory,
    handleDeleteSong,
    handleExportHistory,
    handleImportHistory,
  };
};
