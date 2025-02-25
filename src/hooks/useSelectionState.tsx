import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Generic interface for selectable items with unique identifiers
 */
export interface Selectable {
  id?: string | number;
  [key: string]: any;
}

/**
 * Selection state and functions
 */
export interface SelectionState<T extends Selectable> {
  selectedItem: T | undefined;
  selectedItemId: string | number | undefined;
  selectItem: (item: T) => void;
  selectItemById: (id: string | number) => void;
  clearSelection: () => void;
  isSelected: (item: T) => boolean;
  isSelectedById: (id: string | number) => boolean;
}

/**
 * Options for the selection hook
 */
export interface SelectionOptions<T extends Selectable> {
  initialItem?: T;
  idField?: keyof T; // Field to use as unique identifier, defaults to 'id'
  compareFn?: (a: T, b: T) => boolean; // Custom comparison function
}

/**
 * Hook to manage selection state for any type of items
 * Can be used standalone or with context provider
 * 
 * @param options Selection options
 * @param items Optional array of available items (required for selectItemById)
 * @returns Selection state and functions
 */
export function useSelectionState<T extends Selectable>(
  options: SelectionOptions<T> = {},
  items?: T[]
): SelectionState<T> {
  const {
    initialItem,
    idField = 'id' as keyof T,
    compareFn = (a, b) => a === b,
  } = options;

  const [selectedItem, setSelectedItem] = useState<T | undefined>(initialItem);

  // Get the ID of the currently selected item
  const selectedItemId = selectedItem?.[idField] as string | number | undefined;

  // Select an item by direct reference
  function selectItem(item: T) {
    setSelectedItem(item);
  }

  // Select an item by its ID (requires items array)
  function selectItemById(id: string | number) {
    if (!items) {
      console.warn('Cannot select by ID without items array');
      return;
    }
    
    const item = items.find(item => item[idField] === id);
    if (item) {
      setSelectedItem(item);
    }
  }

  // Clear the selection
  function clearSelection() {
    setSelectedItem(undefined);
  }

  // Check if an item is selected by reference
  function isSelected(item: T): boolean {
    if (!selectedItem) return false;
    return compareFn(selectedItem, item);
  }

  // Check if an item is selected by ID
  function isSelectedById(id: string | number): boolean {
    if (!selectedItemId) return false;
    return selectedItemId === id;
  }

  return {
    selectedItem,
    selectedItemId,
    selectItem,
    selectItemById,
    clearSelection,
    isSelected,
    isSelectedById,
  };
}

// Create context for global selection state
export function createSelectionContext<T extends Selectable>() {
  return createContext<SelectionState<T> | undefined>(undefined);
}

// Context provider for global selection state
export interface SelectionProviderProps<T extends Selectable> {
  children: ReactNode;
  options?: SelectionOptions<T>;
  items?: T[];
}

export function createSelectionProvider<T extends Selectable>(SelectionContext: React.Context<SelectionState<T> | undefined>) {
  return function SelectionProvider({ children, options = {}, items }: SelectionProviderProps<T>) {
    const selectionState = useSelectionState<T>(options, items);
    
    return (
      <SelectionContext.Provider value={selectionState}>
        {children}
      </SelectionContext.Provider>
    );
  };
}

// Hook to use global selection context
export function createSelectionHook<T extends Selectable>(SelectionContext: React.Context<SelectionState<T> | undefined>) {
  return function useSelection(): SelectionState<T> {
    const context = useContext(SelectionContext);
    
    if (!context) {
      throw new Error('useSelection must be used within a SelectionProvider');
    }
    
    return context;
  };
}