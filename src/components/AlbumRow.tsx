import React, { useState } from "react";
import { format, player } from "../utils/utils";
import SongRow from "./SongRow";
import { Song } from "../types/spicetify-history";

/**
 * Props for the AlbumRow component.
 * Represents a grouped album containing multiple songs.
 */
interface AlbumRowProps {
  songs: Song[];
  currentPage: number;
  pageSize: number;
  currentPlayingUid: React.RefObject<string | null>;
  currentPlayingUri: React.RefObject<string | null>;
  onDelete: (uid: string) => void;
  onPlayPause: (uri: string, uid: string) => void;
}

/**
 * Renders a collapsible row representing an album group.
 * Shows album metadata, play/delete controls, and toggles expanded state to show individual songs.
 */
const AlbumRow: React.FC<AlbumRowProps> = ({
  songs,
  currentPage,
  pageSize,
  currentPlayingUid,
  currentPlayingUri,
  onDelete,
  onPlayPause,
}) => {
  const [expanded, setExpanded] = useState(false);
  const album = songs[0]?.album;
  const imageUrl = songs[0]?.images?.[0]?.url || "/default-image.png";
  const listenDate = format.handleSongDate(songs[0]);

  return (
    <div className="albumRowContainer">
      {/* Collapsed album row */}
      <div
        className="songRow albumRow"
        onClick={() => setExpanded((prev) => !prev)}
        style={{ userSelect: "none" }}
      >
        {/* Toggle button */}
        <div className="songIndex">
          <span className="indexNumber">{expanded ? "−" : "+"}</span>
        </div>

        {/* Album image and artist */}
        <div className="songDetails">
          <div className="songImageContainer">
            <img src={imageUrl} alt={album?.name} className="songImage" />
          </div>
          <div className="songDetailsText">
            <div className="songName" title={album?.name}>
              {album?.name}
            </div>
            <div
              className="songArtist"
              onClick={(e) => {
                e.stopPropagation();
                Spicetify.Platform.History.push(
                  `/artist/${songs[0].artists?.[0].uri.split(":")[2]}`
                );
              }}
            >
              {songs[0].artists?.map((a) => a.name).join(", ")}
            </div>
          </div>
        </div>

        {/* Representative song */}
        <div className="songAlbum">
          {songs[0].name.length > 50 ? `${songs[0].name.substring(0, 50)}...` : songs[0].name}
        </div>

        {/* Date */}
        <div className="songDate">{listenDate}</div>

        {/* Song count */}
        <div className="songDuration">{songs.length} songs</div>

        {/* Bulk delete */}
        <div className="songActions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              songs.forEach((song) => onDelete(song.uid));
            }}
            title="Delete all songs in album"
          >
            X
          </button>
        </div>
      </div>

      {/* Expanded: Show individual SongRows */}
      {expanded &&
        songs.map((song, index) => (
          <SongRow
            key={song.uid}
            song={song}
            index={index}
            pageSize={pageSize}
            currentPage={currentPage}
            currentPlayingUid={currentPlayingUid}
            currentPlayingUri={currentPlayingUri}
            onDelete={onDelete}
            onPlayPause={onPlayPause}
          />
        ))}
    </div>
  );
};

export default AlbumRow;
