import React, { ReactNode } from "react";
import { Search, Filter, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataPagination } from "@/components/DataPagination";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  align?: "left" | "center" | "right";
  mobileHidden?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  title?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  renderMobileCard?: (item: T) => ReactNode;
  pagination: {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  actions?: (item: T) => ReactNode;
  idField?: keyof T;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  title,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  filters,
  activeFiltersCount = 0,
  onClearFilters,
  renderMobileCard,
  pagination,
  actions,
  idField = "id" as keyof T,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();

  return (
    <Card className="border-0 shadow-none bg-transparent sm:border sm:shadow-sm sm:bg-card sm:rounded-lg -mt-3 sm:mt-0">
      <CardContent className="p-0 sm:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {title && <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>}
            
            <div className="hidden sm:flex items-center gap-2">
              {activeFiltersCount > 0 && onClearFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <X className="mr-1 h-3 w-3" /> Limpar filtros
                </Button>
              )}
              
              {filters && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={`h-8 border-dashed ${activeFiltersCount > 0 ? "border-primary text-primary" : ""}`}>
                      <Filter className="mr-2 h-3.5 w-3.5" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal lg:hidden">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    {filters}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {onSearchChange && (
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder={searchPlaceholder} 
                value={searchValue} 
                onChange={(e) => onSearchChange(e.target.value)} 
                className="pl-10 h-10 bg-muted/30 border-muted focus-visible:ring-primary/20 focus-visible:bg-background transition-all" 
              />
            </div>
          )}
        </div>

        {isMobile ? (
          <div className="space-y-3">
            {loading && data.length === 0 ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2 animate-pulse">
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                ))}
              </>
            ) : data.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                Nenhum registro encontrado.
              </div>
            ) : data.map((item, index) => (
              <React.Fragment key={String(item[idField]) || index}>
                {renderMobileCard ? renderMobileCard(item) : (
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
                    {columns.map((col, colIdx) => (
                      <div key={colIdx} className="flex justify-between text-sm">
                        <span className="font-medium text-muted-foreground">{col.header}</span>
                        <span>
                          {typeof col.accessor === "function" 
                            ? col.accessor(item) 
                            : String(item[col.accessor])}
                        </span>
                      </div>
                    ))}
                    {actions && (
                      <div className="flex justify-end pt-2 border-t border-border/50">
                        {actions(item)}
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                  {columns.map((col, idx) => (
                    <TableHead 
                      key={idx} 
                      className={`py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                  {actions && <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right pr-6">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Carregando registros...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow 
                      key={String(item[idField]) || index} 
                      className={`group hover:bg-muted/20 transition-colors border-b ${onRowClick ? "cursor-pointer" : ""} ${typeof rowClassName === "function" ? rowClassName(item) : rowClassName || ""}`}
                      onClick={() => onRowClick?.(item)}
                    >
                      {columns.map((col, colIdx) => (
                        <TableCell 
                          key={colIdx} 
                          className={`align-top py-4 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
                        >
                          {typeof col.accessor === "function" 
                            ? col.accessor(item) 
                            : String(item[col.accessor])}
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell className="align-top py-4 text-right pr-6">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {actions(item)}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="pt-2">
          <DataPagination
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            currentPage={pagination.currentPage}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
