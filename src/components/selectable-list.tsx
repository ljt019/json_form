import { ReactNode, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Selectable } from "@/hooks/useSelectionState";
import { useEnhancedFilteredList, FilterOptions } from "@/hooks/useFilteredList";

export interface SelectableListProps<T extends Selectable> {
  items: T[];
  selectedItems: T[];
  onSelect: (item: T, shiftKey: boolean, ctrlKey: boolean) => void;
  onHover?: (item: T | null) => void;
  title: string;
  icon: ReactNode;
  onBack?: () => void;
  renderItem: (
    item: T,
    isSelected: boolean
  ) => ReactNode;
  footerContent?: (filteredItems: T[]) => ReactNode;
  filterOptions?: FilterOptions<T>;
  searchPlaceholder?: string;
  showPagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  idField?: keyof T;
}

export function SelectableList<T extends Selectable>({
  items,
  selectedItems,
  onSelect,
  onHover,
  title,
  icon,
  onBack,
  renderItem,
  footerContent,
  filterOptions,
  searchPlaceholder = "Search...",
  showPagination = false,
  pageSize = 10,
  sortable = false,
  idField = 'name' as keyof T,
}: SelectableListProps<T>) {
  // Set up default filter options
  const defaultFilterOptions: FilterOptions<T> = {
    filterFields: [idField as keyof T],
    pageSize,
    ...filterOptions,
  };
  
  // Use our enhanced filtered list hook
  const {
    filter,
    setFilter,
    currentPageItems,
    filteredItems,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    sortItems,
    currentSortField,
    currentSortDirection,
  } = useEnhancedFilteredList<T>(items, defaultFilterOptions);

  // Determine which items to display (paginated or all)
  const displayedItems = showPagination ? currentPageItems : filteredItems;
  
  // Check if an item is selected
  const isItemSelected = useCallback((item: T) => {
    return selectedItems.some((selected) => 
      // Use the idField to compare items
      selected[idField] === item[idField]
    );
  }, [selectedItems, idField]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        {/* Sort controls */}
        {sortable && (
          <div className="px-4 pb-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sortItems(idField as keyof T, 'asc')}
              className={`text-xs ${currentSortField === idField && currentSortDirection === 'asc' ? 'bg-primary/20' : ''}`}
            >
              <ArrowUp className="w-3 h-3 mr-1" />
              Name
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sortItems(idField as keyof T, 'desc')}
              className={`text-xs ${currentSortField === idField && currentSortDirection === 'desc' ? 'bg-primary/20' : ''}`}
            >
              <ArrowDown className="w-3 h-3 mr-1" />
              Name
            </Button>
          </div>
        )}
        
        <ScrollArea className="flex-grow">
          <div className="px-4 py-2">
            {displayedItems.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                {filter
                  ? "No matches found."
                  : `No ${title.toLowerCase()} found.`}
              </div>
            ) : (
              <ul className="space-y-1">
                {displayedItems.map((item) => {
                  const isSelected = isItemSelected(item);
                  
                  return (
                    <li
                      key={String(item[idField])}
                      className={`py-2 px-3 rounded-md cursor-pointer transition-colors group ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={(e) => onSelect(item, e.shiftKey, e.ctrlKey)}
                      onMouseEnter={() => onHover?.(item)}
                      onMouseLeave={() => onHover?.(null)}
                    >
                      {renderItem(item, isSelected)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
        
        {/* Pagination controls */}
        {showPagination && totalPages > 1 && (
          <div className="px-4 py-2 flex justify-between items-center border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {footerContent && (
          <div className="px-4 py-2 mt-auto border-t">
            {footerContent(filteredItems)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}