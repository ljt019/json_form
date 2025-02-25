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
import { useSelectionState } from "./useSelectionState";

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

  const { selectedItems: selectedSwitches, handleSelect } =
    useSelectionState<SwitchItem>(switchList, {
      withShiftSelect: true,
      withCtrlSelect: true,
    });

  // Provide backward compatible API for existing components
  const handleSelectSwitch = useCallback(
    (sw: SwitchItem, shiftKey: boolean, ctrlKey: boolean) => {
      startTransition(() => {
        handleSelect(sw, shiftKey, ctrlKey);
      });
    },
    [handleSelect]
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
