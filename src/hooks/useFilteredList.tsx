import { useState, useMemo, useCallback } from 'react';

// Simple, compatible version for existing code
export function useFilteredList<T>(
  items: T[],
  searchTerm: string,
  getSearchField: (item: T) => string
) {
  return useMemo(
    () =>
      items.filter((item) =>
        getSearchField(item).toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [items, searchTerm, getSearchField]
  );
}

// Enhanced version with pagination, sorting, and better filtering
export interface FilterOptions<T> {
  initialFilter?: string;
  filterFields?: (keyof T)[];
  customFilterFn?: (item: T, filter: string) => boolean;
  sortField?: keyof T;
  sortDirection?: 'asc' | 'desc';
  customSortFn?: (a: T, b: T) => number;
  pageSize?: number;
}

export interface FilteredListState<T> {
  // Filter and sort state
  items: T[];
  filteredItems: T[];
  filter: string;
  setFilter: (filter: string) => void;
  totalItems: number;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Functions for pagination
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Items on the current page
  currentPageItems: T[];
  
  // Advanced functions
  sortItems: (field: keyof T, direction?: 'asc' | 'desc') => void;
  currentSortField: keyof T | undefined;
  currentSortDirection: 'asc' | 'desc';
  resetFilters: () => void;
}

/**
 * Enhanced hook to provide filtering, sorting, and pagination for lists
 * 
 * @param items The array of items to filter, sort, and paginate
 * @param options Options for filtering, sorting, and pagination
 * @returns Filtered list state and functions
 */
export function useEnhancedFilteredList<T>(
  items: T[],
  options: FilterOptions<T> = {}
): FilteredListState<T> {
  // Destructure options with defaults
  const {
    initialFilter = '',
    filterFields = [],
    customFilterFn,
    sortField,
    sortDirection = 'asc',
    customSortFn,
    pageSize = 10
  } = options;

  // State for filter, sort, and pagination
  const [filter, setFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [currentSortField, setCurrentSortField] = useState<keyof T | undefined>(sortField);
  const [currentSortDirection, setCurrentSortDirection] = useState<'asc' | 'desc'>(sortDirection);

  // Default filter function
  const defaultFilterFn = useCallback((item: T, filterText: string): boolean => {
    if (!filterText.trim()) return true;
    
    const lowerFilter = filterText.toLowerCase();
    
    // If no fields specified, try to filter by toString()
    if (filterFields.length === 0) {
      return String(item).toLowerCase().includes(lowerFilter);
    }
    
    // Check if any of the specified fields match the filter
    return filterFields.some(field => {
      const value = item[field];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(lowerFilter);
    });
  }, [filterFields]);

  // Sort function
  const sortFn = useCallback((a: T, b: T): number => {
    if (customSortFn) {
      return customSortFn(a, b);
    }
    
    if (!currentSortField) return 0;
    
    const valueA = a[currentSortField];
    const valueB = b[currentSortField];
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return currentSortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle number comparison
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return currentSortDirection === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    }
    
    // Fall back to string comparison
    return currentSortDirection === 'asc'
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  }, [customSortFn, currentSortField, currentSortDirection]);

  // Apply filters and sorting
  const filteredItems = useMemo(() => {
    // First, filter the items
    const filterFn = customFilterFn || defaultFilterFn;
    let result = items.filter(item => filterFn(item, filter));
    
    // Then, sort the filtered items
    if (currentSortField || customSortFn) {
      result = [...result].sort(sortFn);
    }
    
    return result;
  }, [items, filter, customFilterFn, defaultFilterFn, currentSortField, sortFn]);

  // Calculate pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / currentPageSize));
  
  // Ensure current page is valid
  const validatedCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  if (validatedCurrentPage !== currentPage) {
    setCurrentPage(validatedCurrentPage);
  }
  
  // Get items for current page
  const startIndex = (validatedCurrentPage - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, totalItems);
  const currentPageItems = filteredItems.slice(startIndex, endIndex);

  // Navigation functions
  const nextPage = useCallback(() => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  }, [totalPages]);
  
  const prevPage = useCallback(() => {
    setCurrentPage(page => Math.max(page - 1, 1));
  }, []);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);
  
  const setPageSize = useCallback((size: number) => {
    setCurrentPageSize(size);
    // Reset to page 1 when changing page size
    setCurrentPage(1);
  }, []);

  // Sorting function
  const sortItems = useCallback((field: keyof T, direction?: 'asc' | 'desc') => {
    if (currentSortField === field) {
      // Toggle direction if same field
      if (!direction) {
        setCurrentSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setCurrentSortDirection(direction);
      }
    } else {
      // Set new field and direction
      setCurrentSortField(field);
      setCurrentSortDirection(direction || 'asc');
    }
  }, [currentSortField]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilter('');
    setCurrentPage(1);
    setCurrentSortField(sortField);
    setCurrentSortDirection(sortDirection);
  }, [sortField, sortDirection]);

  return {
    // Filter and sort state
    items,
    filteredItems,
    filter,
    setFilter,
    totalItems,
    
    // Pagination state
    currentPage: validatedCurrentPage,
    totalPages,
    pageSize: currentPageSize,
    
    // Functions for pagination
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    
    // Items on the current page
    currentPageItems,
    
    // Advanced functions
    sortItems,
    currentSortField,
    currentSortDirection,
    resetFilters,
  };
}