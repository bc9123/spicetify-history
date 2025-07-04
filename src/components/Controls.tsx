import React from "react";
import { ControlsProps } from "../types/spicetify-history";

/**
 * Controls Component
 *
 * Displays buttons for clearing, exporting, and importing history,
 * a search bar for filtering songs, and a settings menu to change options.
 */
const Controls: React.FC<ControlsProps> = ({
  searchQuery,
  setSearchQuery,
  handleClearHistory,
  handleExportHistory,
  handleImportHistory,
  showImportHistoryModal,
  showOptionsModal,
  navigationType,
  pageSize,
  displayedHistoryType,
  setPageSize,
  setNavigationType,
  setCurrentPage,
  setDisplayedHistoryType,
}) => {
  const openOptions = () => {
    showOptionsModal({
      pageSize,
      pageNavigationType: navigationType,
      displayedHistoryType,
      onConfirm: ({ pageSize: newSize, pageNavigationType: newNav, displayedHistoryType: newType }) => {
        setPageSize(newSize);
        setNavigationType(newNav);
        setDisplayedHistoryType(newType);
        setCurrentPage(1);
      },
    });
  };

  return (
    <div className="controls">
      {/* Action buttons: clear, export, import */}
      <div className="buttonsContainer">
        <button onClick={handleClearHistory}>Clear history</button>
        <button onClick={handleExportHistory}>Export history</button>
        <button onClick={() => showImportHistoryModal(handleImportHistory)}>Import history</button>
      </div>

      {/* Search input and settings menu */}
      <div className="searchAndOptions">
        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="searchInput"
          />
        </div>

        <div className="optionsContainer">
          <span className="optionsButton" onClick={openOptions}>
            <svg
              className="optionsIcon"
              dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons["menu"] }}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Controls;
