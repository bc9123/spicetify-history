import { useState, useEffect, useRef, useCallback } from "react";
import { UseInfiniteScrollParams } from "../types/spicetify-history";

/**
 * Custom hook for implementing infinite scroll behavior.
 * 
 * @param totalItems - Total number of items available.
 * @param pageSize - Number of items to load each time the bottom is reached.
 * @param enabled - Whether infinite scroll is active.
 * 
 * @returns An object containing:
 * - `visibleCount`: Number of items currently visible.
 * - `isLoading`: Whether more items are being loaded.
 * - `containerRef`: Ref to the scrollable container that triggers loading.
 */
export function useInfiniteScroll({
  totalItems,
  pageSize,
  enabled,
}: UseInfiniteScrollParams) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Loads the next batch of items if not already loading.
   */
  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= totalItems) return;

    setIsLoading(true);

    // Simulate async loading
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + pageSize, totalItems));
      setIsLoading(false);
    }, 500);
  }, [isLoading, visibleCount, pageSize, totalItems]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    /**
     * Checks if scroll position is near the bottom and triggers `loadMore`.
     */
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMore, enabled]);

  useEffect(() => {
    if (!enabled) {
      setVisibleCount(pageSize);
    }
  }, [enabled, pageSize]);

  return { visibleCount, isLoading, containerRef };
}
