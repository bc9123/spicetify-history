import React, { useRef, useEffect, useState, useCallback } from "react";
import { openDB, getHistoryFromDB, deleteSongFromDB, clearHistoryFromDB, exportHistoryAsFile, Song, importHistoryAsFile } from "./db";
import "./css/app.scss";

const App: React.FC = () => {
  // IndexedDB instance
  const [db, setDb] = useState<IDBDatabase | undefined>(undefined);

  // Songs history state
  const [songs, setSongs] = useState<Song[]>([]);

  // Debounce timeout for search
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered songs state
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sorting configuration state
  const [sortConfig, setSortConfig] = useState<{ key: string; ascending: boolean }>({ key: "date", ascending: false });

  // Currently playing song tracking
  const currentPlayingUid = useRef<string | null>(null);
  const currentPlayingUri = useRef<string | null>(null);

  /**
   * Fetches the history from the IndexedDB and sorts it based on the current sorting configuration.
   */
  const fetchHistory = useCallback(async () => {
    try {
      const database = await openDB();
      const songsFromDB = await getHistoryFromDB(database);
      setDb(database);
      const sortedSongs = sortSongs(songsFromDB, sortConfig);
      setSongs(sortedSongs);
      setFilteredSongs(sortedSongs);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, [sortConfig]);


  /**
   * Sorts the songs based on the provided sort configuration.
   * @param songs The songs history to sort.
   * @param sortConfig The sort configuration, containing the key to sort by and the sorting direction.
   * @returns A sorted array of songs.
   */
  const sortSongs = (songs: Song[], sortConfig: { key: string; ascending: boolean }): Song[] => {
    const sortedSongs = [...songs].sort((a, b) => {
      if (sortConfig.key === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortConfig.key === "album") {
        return (a.album?.name || "").localeCompare(b.album?.name || "");
      } else if (sortConfig.key === "date") {
        return a.listenDate - b.listenDate;
      } else if (sortConfig.key === "duration") {
        return a.duration.milliseconds - b.duration.milliseconds;
      }
      return 0;
    });
    if (!sortConfig.ascending) sortedSongs.reverse();
    return sortedSongs;
  };

  // Fetch history on component mount.
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Event listeners for song change and play/pause.
  useEffect(() => {
    const handleSongChange = () => {
      fetchHistory();
      const currentItem = Spicetify.Player.data?.item;
      if (currentItem && currentItem.type === "track") {
        currentPlayingUri.current = currentItem.uri;
        currentPlayingUid.current = currentItem.uid;
      }
    };

    Spicetify.Player.addEventListener("onplaypause", handleSongChange);
    Spicetify.Player.addEventListener("songchange", handleSongChange);
    return () => {
      Spicetify.Player.removeEventListener("songchange", handleSongChange);
      Spicetify.Player.removeEventListener("onplaypause", handleSongChange);
    };
  }, [fetchHistory]);

  // Input change for search query.
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  
  debounceTimeoutRef.current = setTimeout(() => {
    const filtered = songs.filter(
      (song) =>
        song.name.toLowerCase().includes(query) ||
        song.album?.name?.toLowerCase().includes(query) ||
        song.artists?.some((artist) => artist.name.toLowerCase().includes(query))
    );
    setFilteredSongs(filtered);
  }, 300);
  };

  /**
   * Handles play/pause logic for a song.
   * If the song is paused, it resumes; if a different song is clicked, it plays from start.
   * @param songUri - The URI of the song.
   * @param songUid - The unique identifier for the song.
   */
  const handlePlayPauseSong = (songUri: string, songUid: string) => {
    if (Spicetify && Spicetify.Player) {
      if (songUri === currentPlayingUri.current) {
        if (Spicetify.Player.isPlaying()) {
          Spicetify.Player.pause();
        } else {
          Spicetify.Player.play();
        }
      } else {
        Spicetify.Player.playUri(songUri).then(() => {
          currentPlayingUri.current = songUri;
          currentPlayingUid.current = songUid;
        });
      }
    }
  };

  /**
   * Formats a song duration (milliseconds) into a readable string (MM:SS).
   * @param ms - Duration in milliseconds.
   * @returns Formatted string.
   */
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  /**
   * Handles clearing the history.
   */
  const handleClearHistory = async () => {
    if (db) {
      try {
        await clearHistoryFromDB(db);
        fetchHistory();
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  /**
   * Handles exporting the history.
   */
  const handleExportHistory = async () => {
    if (db) {
      try {
        await exportHistoryAsFile(db);
      } catch (error) {
        console.error("Failed to export history:", error);
      }
    }
  };

  /** 
   * Handles importing the history.
  */
  const handleImportHistory = async (file: File) => {
    if (db) {
      try {
        await importHistoryAsFile(db, file);
        fetchHistory();
        Spicetify.PopupModal.hide();
      } catch (error) {
        console.error("Failed to import history:", error);
      }
    } else {
      Spicetify.showNotification("Database not ready");
    }
  };

  /**
   * Handles deleting a song from the history.
   * @param songUid - The unique identifier for the song to delete.
   */
  const handleDeleteSong = async (songUid: string) => {
    if (db) {
      try {
        await deleteSongFromDB(db, songUid);
        fetchHistory();
      } catch (error) {
        console.error("Failed to delete song:", error);
      }
    }
  };

  /**
   * Sorts the songs based on the provided key.
   * If the same key is clicked, it toggles the sorting direction.
   * @param key - The key to sort by.
   */
  const sortByColumn = (key: string) => {
    setSortConfig((prevSortConfig) => ({
      key,
      ascending: prevSortConfig.key === key ? !prevSortConfig.ascending : true,
    }));
  };

  return (
    <div className="historyPage">
      {/* Header Section */}
      <div className="header">
        <h1>History</h1>
      </div>

      {/* Controls Section */}
      <div className="controls">
        {/* Buttons for clearing, exporting, and importing history */}
        <div className="buttonsContainer">
          <button onClick={handleClearHistory}>Clear history</button>
          <button onClick={handleExportHistory}>Export history</button>
          <button onClick={() => {
              Spicetify.PopupModal.display({
                title: "Import History",
                content: `
                  <div id="import_history_modal">
                    <div class="fileInputContainer">
                      <label for="import_file_input" class="custom-file-upload">&#10514;</label>
                      <input 
                        id="import_file_input" 
                        type="file" 
                        name="file" 
                        accept=".json"
                        required 
                      />
                    </div>
                    <button id="import_history_button">Import</button>
                  </div>
                `,
              });

              setTimeout(() => {
                const importHistoryModalContainer = document.querySelector(".main-trackCreditsModal-container");
                const importHistoryModal = document.getElementById("import_history_modal") as HTMLDivElement;
                const fileInput = document.getElementById("import_file_input") as HTMLInputElement;
                const importButton = document.getElementById("import_history_button") as HTMLButtonElement;

                if (!importHistoryModalContainer || !importHistoryModal || !fileInput || !importButton) {
                  Spicetify.showNotification("Modal not found");
                  console.error("Modal elements not found, retrying...");
                  return;
                }

                importHistoryModalContainer.classList.add("importHistoryModalContainer")
                importHistoryModal.classList.add("importHistoryModal");
                fileInput.classList.add("fileInput");
                importButton.classList.add("importButton");
                importButton.addEventListener("click", async () => {
                  if (!fileInput.files || fileInput.files.length === 0) {
                    Spicetify.showNotification("Please select a file");
                    return;
                  }
                  const file = fileInput.files[0];
                  await handleImportHistory(file);
                });
              }, 100);
            }}
          >
            Import history
          </button>
        </div>

        {/* Search input for filtering songs */}
        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="searchInput"
          />
        </div>
      </div>

      {/* Song List */}
      <div className="songList">
        {/* Header Row */}
        <div className="songListHeaderRow">
          <div className="headerIndex">#</div>
          <div onClick={() => sortByColumn("name")} className="headerTitle">Title</div>
          <div onClick={() => sortByColumn("album")} className="headerAlbum">Album</div>
          <div onClick={() => sortByColumn("date")} className="headerDate">Date Added</div>
          <div onClick={() => sortByColumn("duration")} className="headerDuration">Duration</div>
          <div></div>
        </div>

        {filteredSongs.length === 0 ? (
          <p>No history available.</p>
        ) : (
          filteredSongs.map((song, index) => (
            <div key={song.uid || index} className="songRow">
              {/* Column 1: Index */}
              <div className="songIndex">
                <span className="indexNumber">{index + 1}</span>
                <span
                  className="playPauseIcon"
                  onClick={() => handlePlayPauseSong(song.uri, song.uid)}
                >
                  <svg
                    dangerouslySetInnerHTML={{
                      __html:
                        (song.uid === currentPlayingUid.current || song.uri === currentPlayingUri.current) && Spicetify.Player.isPlaying()
                          ? Spicetify.SVGIcons["pause"]
                          : Spicetify.SVGIcons["play"]
                    }}
                  />
                </span>
              </div>
              {/* Column 2: Image, Title and Artist */}
              <div className="songDetails">
                <div className="songImageContainer">
                  <img
                    src={song.images?.[0]?.url || "/default-image.png"}
                    alt={song.name}
                    className="songImage"
                  />
                </div>
                <div className="songDetailsText">
                  <div className="songName" title={song.name}>
                    {song.name.length > 50 ? `${song.name.substring(0, 50)}...` : song.name}
                  </div>
                  <div className="songArtist" onClick={() => Spicetify.Platform.History.push(`/artist/${song.artists?.[0].uri.split(":")[2]}`)}>
                    {song.artists?.map((a: { name: string }) => a.name).join(", ")}
                  </div>
                </div>
              </div>
              {/* Column 3: Album */}
              <div className="songAlbum" onClick={() => Spicetify.Platform.History.push(`/album/${song.album?.uri.split(":")[2]}`)}>
                {song.album?.name.length > 50 ? `${song.album?.name.substring(0, 50)}...` : song.album?.name}
              </div>
              {/* Column 4: Date Added */}
              <div className="songDate">
                {song.listenDate ? new Date(song.listenDate).toLocaleDateString() : ""}
              </div>
              {/* Column 5: Duration */}
              <div className="songDuration">
                {formatDuration(song.duration.milliseconds)}
              </div>
              {/* Column 6: Actions */}
              <div className="songActions">
                <button onClick={() => handleDeleteSong(song.uid)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;