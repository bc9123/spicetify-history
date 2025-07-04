import React, { useRef, useEffect, useState } from "react";
import * as hooks from "./hooks/hooks";
import * as components from "./components/Components";
import * as modals from "./modals/modals";
import { player } from "./utils/utils";
import {
  NavigationType,
  DisplayedHistoryType,
  SavedOptions,
  Song
} from "./types/spicetify-history";
import "./css/app.scss";

// Key used to persist user options in localStorage
const STORAGE_KEY = "historyAppOptions";

// Default fallback options
const defaultOptions: SavedOptions = {
  pageSize: 50,
  navigationType: "pagination",
  displayedHistoryType: "song",
};

/**
 * Loads saved user preferences from localStorage.
 */
const loadOptions = (): SavedOptions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as SavedOptions;
  } catch {
    // Fallback to default options on error
    console.warn("Failed to load saved options, using defaults.");
  }
  return defaultOptions;
};

/**
 * Saves current user preferences to localStorage.
 */
const saveOptions = (opts: SavedOptions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
};

const App: React.FC = () => {
  // Load persisted display settings
  const savedOptions = loadOptions();

  // UI state
  const [pageSize, setPageSize] = useState<number>(savedOptions.pageSize);
  const [navigationType, setNavigationType] = useState<NavigationType>(savedOptions.navigationType);
  const [displayedHistoryType, setDisplayedHistoryType] = useState<DisplayedHistoryType>(
    savedOptions.displayedHistoryType
  );

  // Sorting hooks for both views
  const {
    songSortConfig,
    songSortBy,
    albumSortConfig,
    albumSortBy
  } = hooks.useSort<Song>("listenDate", false);

  // Load song data and attach sort config
  const {
    songs,
    fetchHistory,
    handleClearHistory,
    handleDeleteSong,
    handleExportHistory,
    handleImportHistory
  } = hooks.useHistoryDB(
    displayedHistoryType === "song" ? songSortConfig : albumSortConfig
  );

  // Filtered songs by search
  const { searchQuery, setSearchQuery, filteredSongs } = hooks.useDebouncedSearch(songs);

  // Track current playing song
  const { currentPlayingUid, currentPlayingUri } = hooks.usePlayerTracking(fetchHistory);

  // Pagination logic
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedSongs
  } = hooks.usePagination(filteredSongs, pageSize);

  // Infinite scroll logic
  const { visibleCount, containerRef, isLoading } = hooks.useInfiniteScroll({
    totalItems: filteredSongs.length,
    pageSize,
    enabled: navigationType === "infiniteScroll"
  });

  // Reset to first page when relevant changes occur
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, songSortConfig, pageSize, navigationType, displayedHistoryType]);

  // Persist display settings
  useEffect(() => {
    saveOptions({
      pageSize,
      navigationType,
      displayedHistoryType
    });
  }, [pageSize, navigationType, displayedHistoryType]);

  // Choose slice logic based on scroll or pagination
  const baseSongs =
    navigationType === "pagination"
      ? paginatedSongs
      : filteredSongs.slice(0, visibleCount);

  // Conditionally prepare song/album structure for render
  const displayedSongs = hooks.useDisplayedSongs(
    baseSongs,
    visibleCount,
    displayedHistoryType,
    albumSortConfig
  );

  return (
    <div className="historyPage">
      {/* Page Header */}
      <div className="header">
        <h1>History</h1>
      </div>

      {/* User Controls */}
      <components.Controls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleClearHistory={handleClearHistory}
        handleExportHistory={handleExportHistory}
        handleImportHistory={handleImportHistory}
        showImportHistoryModal={modals.showImportHistoryModal}
        showOptionsModal={modals.showOptionsModal}
        navigationType={navigationType}
        pageSize={pageSize}
        displayedHistoryType={displayedHistoryType}
        setPageSize={setPageSize}
        setNavigationType={setNavigationType}
        setCurrentPage={setCurrentPage}
        setDisplayedHistoryType={setDisplayedHistoryType}
      />

      {/* Main Song List */}
      <div className="songList" ref={containerRef}>
        {/* Column Headers */}
        <components.HeaderRow
          sortBy={
            displayedHistoryType === "song"
              ? ((key: keyof Song | "songCount") => {
                  if (key !== "songCount") songSortBy(key);
                })
              : albumSortBy
          }
          displayedHistoryType={displayedHistoryType}
        />

        {/* Song or Album List */}
        {displayedHistoryType === "song" ? (
          (displayedSongs as Song[]).map((song, index) => (
            <components.SongRow
              key={song.uid || index}
              song={song}
              index={index}
              pageSize={pageSize}
              currentPage={currentPage}
              currentPlayingUid={currentPlayingUid}
              currentPlayingUri={currentPlayingUri}
              onDelete={handleDeleteSong}
              onPlayPause={(songUri, songUid) =>
                player.handlePlayPauseSong({
                  songUri,
                  songUid,
                  currentPlayingUri,
                  currentPlayingUid
                })
              }
            />
          ))
        ) : (
          Object.entries(displayedSongs).map(([albumId, albumSongs]) => (
            <components.AlbumRow
              key={albumId}
              songs={albumSongs}
              pageSize={pageSize}
              currentPage={currentPage}
              currentPlayingUid={currentPlayingUid}
              currentPlayingUri={currentPlayingUri}
              onDelete={handleDeleteSong}
              onPlayPause={(songUri, songUid) =>
                player.handlePlayPauseSong({
                  songUri,
                  songUid,
                  currentPlayingUri,
                  currentPlayingUid
                })
              }
            />
          ))
        )}
      </div>

      {/* Pagination or Infinite Scroll Footer */}
      <components.Footer
        navigationType={navigationType}
        filteredSongs={filteredSongs}
        isLoading={isLoading}
        visibleCount={visibleCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default App;
