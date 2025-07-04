import React from "react";
import { DisplayedHistoryType, Song } from "../types/spicetify-history";

/**
 * Props for the HeaderRow component.
 * @param sortBy - Callback to sort items by a specific key.
 * @param displayedHistoryType - Whether to render headers for songs or grouped albums.
 */
interface HeaderRowProps {
  sortBy: (key: keyof Song | "songCount") => void;
  displayedHistoryType: DisplayedHistoryType;
}

/**
 * HeaderRow renders the list headers for either song view or album view.
 * - In "song" mode: shows Title, Album, Date Added, Duration
 * - In "album" mode: shows Album, Representative Song, Date Added, Song Count
 */
const HeaderRow: React.FC<HeaderRowProps> = ({ sortBy, displayedHistoryType }) => {
  if (displayedHistoryType === "album") {
    return (
      <div className="songListHeaderRow">
        <div className="headerIndex">#</div>
        <div onClick={() => sortBy("album")} className="headerTitle">
          Album / Title
        </div>
        <div onClick={() => sortBy("name")} className="headerTitle">
          Representative Song / Album
        </div>
        <div onClick={() => sortBy("listenDate")} className="headerDate">
          Date Added
        </div>
        <div onClick={() => sortBy("songCount")} className="headerDuration">
          Songs / Duration
        </div>
        <div></div>
      </div>
    );
  }

  return (
    <div className="songListHeaderRow">
      <div className="headerIndex">#</div>
      <div onClick={() => sortBy("name")} className="headerTitle">
        Title
      </div>
      <div onClick={() => sortBy("album")} className="headerAlbum">
        Album
      </div>
      <div onClick={() => sortBy("listenDate")} className="headerDate">
        Date Added
      </div>
      <div onClick={() => sortBy("duration")} className="headerDuration">
        Duration
      </div>
      <div></div>
    </div>
  );
};

export default HeaderRow;
