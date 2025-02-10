/**
 * db.ts
 *
 * This module handles all IndexedDB operations for the Spicetify History extension.
 * It provides functions to open the database, save a song record, retrieve all records, delete individual records, clear the history, and export history.
 *
 * The database is named "spicetifyHistoryDB" and uses version 1.
 * An object store named "history" is created with a keyPath of "uid", which is assumed to be a unique identifier for each song.
 */

export interface Song {
    uid: string;
    uri: string;
    name: string;
    duration: {
        milliseconds: number;
    };
    album: {
        name: string;
        uri: string;
    };
    artists: {
        uri: string;
        name: string;
    }[];
    metadata: Record<string, any>;
    images: {
        url: string;
        label: string;
    }[];
    listenDate: number;
}

/**
 * Opens the IndexedDB database.
 *
 * @returns A promise that resolves to an open IDBDatabase instance.
 */
export const openDB = (): Promise<IDBDatabase> => {
    const dbName: string = "SpicetifyHistoryDB";
    const dbVersion: number = 1;
    let db;
    
    return new Promise<IDBDatabase>((resolve: (db: IDBDatabase) => void, reject: (reason: string) => void) => {
        const request = indexedDB.open(dbName, dbVersion);
    
        request.onerror = (event: Event) => {
            const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
            console.error("Database error:", (event.target as IDBRequest).error);
            reject(errorMessage);
        };
    
        request.onsuccess = (event: Event) => {
            db = (event.target as IDBRequest).result as IDBDatabase;
            console.log("Database opened successfully");
            resolve(db);
        }
    
        request.onupgradeneeded = (event: Event) => {
            const db = (event.target as IDBRequest).result as IDBDatabase;
            if (!db.objectStoreNames.contains("history")) {
                const objectStore = db.createObjectStore("history", { keyPath: "uid" });
                objectStore.createIndex("name", "name", { unique: false });
                objectStore.createIndex("uri", "uri", { unique: true });
                objectStore.createIndex("listenDate", "listenDate", { unique: false });
                console.log("Object store 'history' created");
            }
        }
    });
}

/**
 * Saves a song record to the "history" object store.
 *
 * @param db - The open IndexedDB database instance.
 * @param song - The song object to be saved.
 * @returns A promise that resolves when the song is successfully saved.
 */
export const saveSongToDB = (db: IDBDatabase, song: Song): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(["history"], "readwrite");
    const objectStore = transaction.objectStore("history");
    const index = objectStore.index("uri");
    const indexRequest = index.get(song.uri);

    indexRequest.onerror = (event: Event) => {
      const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
      console.error("Error retrieving song by uri:", errorMessage);
      reject(errorMessage);
    };

    indexRequest.onsuccess = (event: Event) => {
      const foundSong = (event.target as IDBRequest).result as Song | undefined;
      if (foundSong) {
        console.log(`Song found in index for uri ${song.uri}:`, foundSong);
        foundSong.listenDate = song.listenDate;
        const updateRequest = objectStore.put(foundSong);

        updateRequest.onerror = (event: Event) => {
          const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
          console.error("Error updating song:", errorMessage);
          reject(errorMessage);
        };

        updateRequest.onsuccess = () => {
          console.log("Song listenDate updated:", foundSong.name);
          resolve();
        };
      } else {
        const addRequest = objectStore.add(song);

        addRequest.onerror = (event: Event) => {
          const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
          console.error("Error saving song:", errorMessage);
          reject(errorMessage);
        };

        addRequest.onsuccess = () => {
          console.log("Song added to IndexedDB:", song.name);
          resolve();
        };
      }
    };
  });
};

/**
 * Retrieves all song records from the "history" object store.
 * 
 * @param db - The open IndexedDB database instance.
 * @returns A promise that resolves to an array of song records.
 */
export const getHistoryFromDB = (db: IDBDatabase): Promise<any[]> => {
  return new Promise<any[]>((resolve: (songs: any[]) => void, reject: (reason: string) => void) => {
    const transaction = db.transaction(["history"], "readonly");
    const objectStore = transaction.objectStore("history");
    const request = objectStore.getAll();

    request.onerror = (event: Event) => {
      const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
      console.error("Error retrieving history:", errorMessage);
      reject(errorMessage);
    };

    request.onsuccess = (event: Event) => {
      const songs = (event.target as IDBRequest).result as Song[];
      resolve(songs);
    };
  });
};

/**
 * Deletes a specific song from the "history" object store by its uid.
 *
 * @param db - The open IndexedDB database instance.
 * @param uid - The unique identifier of the song to delete.
 * @returns A promise that resolves when the song is successfully deleted.
 */
export const deleteSongFromDB = (db: IDBDatabase, uid: string): Promise<void> => {
    return new Promise<void>((resolve: () => void, reject: (reason: string) => void) => {
        const transaction = db.transaction(["history"], "readwrite");
        const objectStore = transaction.objectStore("history");
        const request = objectStore.delete(uid);

        request.onerror = (event: Event) => {
            const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
            console.error("Error deleting song:", (event.target as IDBRequest).error);
            Spicetify.showNotification("Failed to delete song");
            reject(errorMessage);
        }

        request.onsuccess = (event: Event) => {
            console.log("Successfully deleted son.");
            Spicetify.showNotification("Song deleted");
            resolve();
        }
    });
}


/**
 * Clears all song records from the "history" object store.
 * 
 * @param db - The open IndexedDB database instance.
 * @returns A promise that resolves when the history is cleared.
 */
export const clearHistoryFromDB = (db: IDBDatabase): Promise<void> => {
    return new Promise<void>((resolve: () => void, reject: (reason: string) => void) => {
        const transaction = db.transaction(["history"], "readwrite");
        const objectStore = transaction.objectStore("history");
        const request = objectStore.clear();

        request.onerror = (event: Event) => {
            const errorMessage = (event.target as IDBRequest).error?.message || "Unknown error";
            console.error("Error clearing history:", (event.target as IDBRequest).error);
            Spicetify.showNotification("Failed to clear history");
            reject(errorMessage);
        }

        request.onsuccess = (event: Event) => {
            console.log("Successfully cleared history.");
            Spicetify.showNotification("History cleared");
            resolve();
        }
    })
}

/**
 * Exports the user's history as a downloadable JSON file.
 * 
 * @param db - The open IndexedDB database instance.
 * @returns A Promise that resolves when the file download is triggered.
 */
export const exportHistoryAsFile = async (db: IDBDatabase): Promise<void> => {
    try {
        const history = await getHistoryFromDB(db);
        if (history.length === 0) {
            Spicetify.showNotification("No history to export");
            return;
        }
        history.sort((a, b) => a.listenDate - b.listenDate);
        const jsonData = JSON.stringify(history, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "spicetify-history-download";
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        Spicetify.showNotification("History exported");
    } catch (error) {
        console.error("Error exporting history:", error);
        Spicetify.showNotification("Failed to export history");
    }
}