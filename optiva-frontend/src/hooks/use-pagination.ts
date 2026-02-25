import { useState, useCallback } from "react";
import type { PaginationParams } from "@/types";

interface UsePaginationOptions {
  defaultSize?: number;
  defaultSortBy?: string;
  defaultSortDir?: "asc" | "desc";
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultSize = 10,
    defaultSortBy = "entryDate",
    defaultSortDir = "desc",
  } = options;

  const [params, setParams] = useState<PaginationParams>({
    page: 0,
    size: defaultSize,
    sortBy: defaultSortBy,
    sortDir: defaultSortDir,
  });

  const setPage = useCallback((page: number) => {
    setParams((p) => ({ ...p, page }));
  }, []);

  const setSize = useCallback((size: number) => {
    setParams((p) => ({ ...p, size, page: 0 }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setParams((p) => ({ ...p, sortBy, page: 0 }));
  }, []);

  const setSortDir = useCallback((sortDir: "asc" | "desc") => {
    setParams((p) => ({ ...p, sortDir, page: 0 }));
  }, []);

  const setDateFrom = useCallback((dateFrom: string) => {
    setParams((p) => ({ ...p, dateFrom: dateFrom || undefined, page: 0 }));
  }, []);

  const setDateTo = useCallback((dateTo: string) => {
    setParams((p) => ({ ...p, dateTo: dateTo || undefined, page: 0 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((p) => ({ ...p, search: search || undefined, page: 0 }));
  }, []);

  const setDrinkType = useCallback((drinkType: string) => {
    setParams((p) => ({
      ...p,
      drinkType: (drinkType || undefined) as PaginationParams["drinkType"],
      page: 0,
    }));
  }, []);

  const reset = useCallback(() => {
    setParams({
      page: 0,
      size: defaultSize,
      sortBy: defaultSortBy,
      sortDir: defaultSortDir,
    });
  }, [defaultSize, defaultSortBy, defaultSortDir]);

  return {
    params,
    setPage,
    setSize,
    setSortBy,
    setSortDir,
    setDateFrom,
    setDateTo,
    setSearch,
    setDrinkType,
    reset,
  };
}
