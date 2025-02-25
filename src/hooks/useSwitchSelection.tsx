"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useState,
  startTransition,
  type ReactNode,
  useCallback,
} from "react";
import type { SwitchItem } from "@/types";

interface SwitchSelectionProviderProps {
  children: ReactNode;
}

interface SwitchSelectionContextType {
  selectedSwitches: SwitchItem[];
  handleSelectSwitch: (
    sw: SwitchItem,
    shiftKey: boolean,
    ctrlKey: boolean
  ) => void;
  displayedSwitch: SwitchItem | null;
  switchList: SwitchItem[];
  setSwitchList: React.Dispatch<React.SetStateAction<SwitchItem[]>>;
}

const SwitchSelectionContext = createContext<
  SwitchSelectionContextType | undefined
>(undefined);

export function SwitchSelectionProvider({
  children,
}: SwitchSelectionProviderProps) {
  const [switchList, setSwitchList] = useState<SwitchItem[]>([]);
  const [selectedSwitches, setSelectedSwitches] = useState<SwitchItem[]>([]);
  const [anchorIndex, setAnchorIndex] = useState<number>(-1);

  const handleShiftSelection = useCallback(
    (currentIndex: number) => {
      if (anchorIndex === -1) {
        return;
      }

      const start = Math.min(anchorIndex, currentIndex);
      const end = Math.max(anchorIndex, currentIndex);

      const newSelection = switchList.slice(start, end + 1);

      setSelectedSwitches(newSelection);
    },
    [anchorIndex, switchList]
  );

  const handleCtrlSelection = useCallback(
    (sw: SwitchItem, currentIndex: number) => {
      const alreadySelected = selectedSwitches.some((s) => s.name === sw.name);

      if (alreadySelected) {
        setSelectedSwitches(selectedSwitches.filter((s) => s.name !== sw.name));
      } else {
        setSelectedSwitches([...selectedSwitches, sw]);
        setAnchorIndex(currentIndex);
      }
    },
    [selectedSwitches]
  );

  const handleSingleSelection = useCallback(
    (sw: SwitchItem, currentIndex: number) => {
      setSelectedSwitches([sw]);
      setAnchorIndex(currentIndex);
    },
    []
  );

  const handleSelectSwitch = useCallback(
    (sw: SwitchItem, shiftKey: boolean, ctrlKey: boolean) => {
      const currentIndex = switchList.findIndex((s) => s.name === sw.name);

      startTransition(() => {
        if (shiftKey) {
          handleShiftSelection(currentIndex);
        } else if (ctrlKey) {
          handleCtrlSelection(sw, currentIndex);
        } else {
          handleSingleSelection(sw, currentIndex);
        }
      });
    },
    [
      switchList,
      handleShiftSelection,
      handleCtrlSelection,
      handleSingleSelection,
    ]
  );

  const value = {
    selectedSwitches,
    handleSelectSwitch,
    displayedSwitch: selectedSwitches[0] ?? switchList[0] ?? null,
    switchList,
    setSwitchList,
  };

  return (
    <SwitchSelectionContext.Provider value={value}>
      {children}
    </SwitchSelectionContext.Provider>
  );
}

export function useSwitchSelection() {
  const context = useContext(SwitchSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useSwitchSelection must be used within a SwitchSelectionProvider"
    );
  }
  return context;
}
