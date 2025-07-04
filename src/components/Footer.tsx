import React from "react";
import Spinner from "./Spinner";
import { FooterProps } from "../types/spicetify-history";

/**
 * Footer Component
 *
 * Displays either:
 * - A loading spinner or message for infinite scrolling
 * - Pagination controls for page-based navigation
 */
const Footer: React.FC<FooterProps> = ({
  navigationType,
  filteredSongs,
  isLoading,
  visibleCount,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const isInfiniteScroll = navigationType === "infiniteScroll";
  const isPagination = navigationType === "pagination";

  return (
    <>
      {/* Infinite Scroll Footer */}
      {isInfiniteScroll && visibleCount < filteredSongs.length && (
        <div className="loadingIndicator">
          {isLoading ? <Spinner /> : ""}
        </div>
      )}

      {/* Pagination Footer */}
      {isPagination && (
        <div className="paginationContainer">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            &lt;
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </>
  );
};

export default Footer;
