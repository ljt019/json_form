import { useMemo } from "react";

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