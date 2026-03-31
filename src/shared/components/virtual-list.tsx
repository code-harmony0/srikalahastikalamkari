/**
 * Virtualized list component for large datasets
 * Prevents DOM overload when rendering hundreds of rows
 */

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  data,
  renderItem,
  itemHeight,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  return (
    <div ref={parentRef} className={`overflow-auto ${className}`} style={{ height: "100%" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(data[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for infinite scroll with virtualization
export function useInfiniteVirtualList<T>(
  fetchPage: (page: number) => Promise<T[]>,
  itemHeight: number,
  hasNextPage: boolean
) {
  const [data, setData] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  // Load more when scrolling near bottom
  React.useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (lastItem.index >= data.length - 5 && hasNextPage && !loading) {
      setLoading(true);
      fetchPage(page + 1).then((newData) => {
        setData((prev) => [...prev, ...newData]);
        setPage((p) => p + 1);
        setLoading(false);
      });
    }
  }, [virtualizer.getVirtualItems(), data.length, hasNextPage, loading, page]);

  return {
    data,
    virtualizer,
    parentRef,
    loading,
    setData,
  };
}
