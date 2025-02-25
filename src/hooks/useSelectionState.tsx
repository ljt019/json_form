import { useState, useCallback } from "react";

export interface Selectable {
  id?: string | number;
  name: string;
}

export interface SelectionState<T extends Selectable> {
  selectedItems: T[];
  handleSelect: (item: T, shiftKey: boolean, ctrlKey: boolean) => void;
  hoveredItem: T | null;
  handleHover: (item: T | null) => void;
}

export function useSelectionState<T extends Selectable>(
  items: T[],
  options?: {
    multiSelect?: boolean;
    withShiftSelect?: boolean;
    withCtrlSelect?: boolean;
  }
): SelectionState<T> {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [hoveredItem, setHoveredItem] = useState<T | null>(null);
  const [anchorIndex, setAnchorIndex] = useState<number>(-1);

  const handleShiftSelection = useCallback(
    (currentIndex: number) => {
      if (anchorIndex === -1 || !options?.withShiftSelect) {
        return;
      }

      const start = Math.min(anchorIndex, currentIndex);
      const end = Math.max(anchorIndex, currentIndex);

      const newSelection = items.slice(start, end + 1);

      setSelectedItems(newSelection);
    },
    [anchorIndex, items, options?.withShiftSelect]
  );

  const handleCtrlSelection = useCallback(
    (item: T, currentIndex: number) => {
      if (!options?.withCtrlSelect) {
        return;
      }

      const alreadySelected = selectedItems.some(
        (s) => s.name === item.name
      );

      if (alreadySelected) {
        setSelectedItems(selectedItems.filter((s) => s.name !== item.name));
      } else {
        setSelectedItems([...selectedItems, item]);
        setAnchorIndex(currentIndex);
      }
    },
    [selectedItems, options?.withCtrlSelect]
  );

  const handleSingleSelection = useCallback(
    (item: T, currentIndex: number) => {
      setSelectedItems([item]);
      setAnchorIndex(currentIndex);
    },
    []
  );

  const handleToggleSelection = useCallback(
    (item: T) => {
      setSelectedItems((prev) => {
        const exists = prev.some((i) => i.name === item.name);
        return exists
          ? prev.filter((i) => i.name !== item.name)
          : [...prev, item];
      });
    },
    []
  );

  const handleSelect = useCallback(
    (item: T, shiftKey: boolean, ctrlKey: boolean) => {
      const currentIndex = items.findIndex((i) => i.name === item.name);

      if (shiftKey && options?.withShiftSelect) {
        handleShiftSelection(currentIndex);
      } else if (ctrlKey && options?.withCtrlSelect) {
        handleCtrlSelection(item, currentIndex);
      } else if (shiftKey && options?.multiSelect) {
        handleToggleSelection(item);
      } else {
        handleSingleSelection(item, currentIndex);
      }
    },
    [
      items,
      options?.multiSelect,
      options?.withShiftSelect,
      options?.withCtrlSelect,
      handleShiftSelection,
      handleCtrlSelection,
      handleToggleSelection,
      handleSingleSelection,
    ]
  );

  const handleHover = useCallback((item: T | null) => {
    setHoveredItem(item);
  }, []);

  return {
    selectedItems,
    handleSelect,
    hoveredItem,
    handleHover,
  };
}