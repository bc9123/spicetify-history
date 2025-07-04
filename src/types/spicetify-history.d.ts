export type NavigationType = "pagination" | "infiniteScroll";
export type DisplayedHistoryType = "song" | "album";

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
  dateFinalized: boolean;
}

export interface SavedOptions {
  pageSize: number;
  navigationType: NavigationType;
  displayedHistoryType: DisplayedHistoryType;
}

export interface FooterProps {
  navigationType: NavigationType;
  filteredSongs: Song[];
  isLoading: boolean;
  visibleCount: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export interface HandlePlayPauseSongProps {
  songUri: string;
  songUid: string;
  currentPlayingUri: React.RefObject<string | null>;
  currentPlayingUid: React.RefObject<string | null>;
}

export type OptionsModalCallback = {
  pageSize: number;
  pageNavigationType: "pagination" | "infiniteScroll";
  displayedHistoryType: "song" | "album";
  onConfirm: (opts: {
    pageSize: number;
    pageNavigationType: "pagination" | "infiniteScroll";
    displayedHistoryType: "song" | "album";
  }) => void;
};

export interface UseInfiniteScrollParams {
  totalItems: number;
  pageSize: number;
  enabled: boolean;
}

export interface HeaderRowProps {
  sortBy: (key: keyof Song) => void;
}

export interface ControlsProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleClearHistory: () => void;
  handleExportHistory: () => void;
  handleImportHistory: (file: File) => void;
  showImportHistoryModal: (cb: (file: File) => void) => void;
  showOptionsModal: (options: OptionsModalCallback) => void;
  navigationType: NavigationType;
  pageSize: number;
  displayedHistoryType: DisplayedHistoryType;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setNavigationType: React.Dispatch<React.SetStateAction<NavigationType>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setDisplayedHistoryType: React.Dispatch<React.SetStateAction<DisplayedHistoryType>>;
}