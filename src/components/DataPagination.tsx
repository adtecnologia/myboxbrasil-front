import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataPaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataPagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
      <p className="text-xs text-muted-foreground text-center sm:text-left">
        {totalItems === 0
          ? "Nenhum registro"
          : `Mostrando ${Math.min((currentPage - 1) * pageSize + 1, totalItems)}–${Math.min(currentPage * pageSize, totalItems)} de ${totalItems}`}
      </p>

      <div className="flex items-center justify-center gap-1.5">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">Por página:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1); }}>
              <SelectTrigger className="h-8 w-[60px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <span className="text-xs text-muted-foreground px-2 min-w-[60px] text-center">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/** Hook to manage pagination state and slice data */
export function usePagination<T>(data: T[], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 1 when data length changes significantly
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize]
  );

  return {
    paginatedData,
    currentPage: safePage,
    pageSize,
    setCurrentPage,
    setPageSize,
    totalItems: data.length,
  };
}
