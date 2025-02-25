import { useState, useCallback, ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Selectable } from "@/hooks/useSelectionState";
import { useFilteredList } from "@/hooks/useFilteredList";

export interface SelectableListProps<T extends Selectable> {
  items: T[];
  selectedItems: T[];
  onSelect: (item: T, shiftKey: boolean, ctrlKey: boolean) => void;
  onHover?: (item: T | null) => void;
  title: string;
  icon: ReactNode;
  onBack: () => void;
  renderItem: (
    item: T,
    isSelected: boolean
  ) => ReactNode;
  footerContent?: (filteredItems: T[]) => ReactNode;
  searchPlaceholder?: string;
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
  searchPlaceholder = "Search...",
}: SelectableListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const getSearchField = useCallback((item: T) => item.name, []);
  const filteredItems = useFilteredList(items, searchTerm, getSearchField);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            {icon}
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <div className="px-4 py-2">
            {filteredItems.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                {searchTerm
                  ? "No matches found."
                  : `No ${title.toLowerCase()} found.`}
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredItems.map((item, index) => {
                  const isSelected = selectedItems.some(
                    (s) => s.name === item.name
                  );
                  
                  return (
                    <li
                      key={item.id ?? item.name}
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
        {footerContent && (
          <div className="px-4 py-2 mt-auto">
            {footerContent(filteredItems)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}