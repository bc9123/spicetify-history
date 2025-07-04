import React from "react";
import { format } from "../utils/utils";
import { Song } from "../types/spicetify-history";

/**
 * Props for the SongRow component.
 */
interface SongRowProps {
  song: Song;
  index: number;
  pageSize: number;
  currentPage: number;
  currentPlayingUid: React.RefObject<string | null>;
  currentPlayingUri: React.RefObject<string | null>;
  onDelete: (uid: string) => void;
  onPlayPause: (uri: string, uid: string) => void;
}

/**
 * Renders a row for a single song in the history list.
 * Includes controls for playback, metadata display, and delete action.
 */
const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  pageSize,
  currentPage,
  currentPlayingUid,
  currentPlayingUri,
  onDelete,
  onPlayPause,
}) => {
  const isPlaying =
    (song.uid === currentPlayingUid.current || song.uri === currentPlayingUri.current) &&
    Spicetify.Player.isPlaying();

  return (
    <div key={song.uid || index} className="songRow">
      {/* Column 1: Index and Play/Pause */}
      <div className="songIndex">
        <span className="indexNumber">{pageSize * (currentPage - 1) + index + 1}</span>
        <span className="playPauseIcon" onClick={() => onPlayPause(song.uri, song.uid)}>
          <svg
            dangerouslySetInnerHTML={{
              __html: isPlaying ? Spicetify.SVGIcons["pause"] : Spicetify.SVGIcons["play"],
            }}
          />
        </span>
      </div>

      {/* Column 2: Song image, title, and artist(s) */}
      <div className="songDetails">
        <div className="songImageContainer">
          <img src={song.images?.[0]?.url || "/default-image.png"} alt={song.name} className="songImage" />
        </div>
        <div className="songDetailsText">
          <div className="songName" title={song.name}>
            {song.name.length > 50 ? `${song.name.substring(0, 50)}...` : song.name}
          </div>
          <div
            className="songArtist"
            onClick={() => Spicetify.Platform.History.push(`/artist/${song.artists?.[0].uri.split(":")[2]}`)}
          >
            {song.artists?.map((a) => a.name).join(", ")}
          </div>
        </div>
      </div>

      {/* Column 3: Album */}
      <div
        className="songAlbum"
        onClick={() => Spicetify.Platform.History.push(`/album/${song.album?.uri.split(":")[2]}`)}
      >
        {song.album?.name.length > 50 ? `${song.album?.name.substring(0, 50)}...` : song.album?.name}
      </div>

      {/* Column 4: Date played */}
      <div className="songDate">{format.handleSongDate(song)}</div>

      {/* Column 5: Duration */}
      <div className="songDuration">{format.formatDuration(song.duration.milliseconds)}</div>

      {/* Column 6: Delete button */}
      <div className="songActions">
        <button onClick={() => onDelete(song.uid)}>X</button>
      </div>
    </div>
  );
};

export default SongRow;
