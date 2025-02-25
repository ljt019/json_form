"use client";

import type React from "react";
import { useState, startTransition, type ReactNode, useCallback } from "react";
import type { SwitchItem } from "@/types";
import { 
  createSelectionContext, 
  createSelectionProvider, 
  createSelectionHook,
  Selectable
} from "./useSelectionState";

// Extend the SwitchItem to include our selectable interface requirements
interface SelectableSwitchItem extends SwitchItem, Selectable {
  // The mesh_name property will be used as the unique identifier
}

// Create the context, provider, and hook
const SwitchSelectionContext = createSelectionContext<SelectableSwitchItem>();
const BaseSwitchSelectionProvider = createSelectionProvider<SelectableSwitchItem>(SwitchSelectionContext);
const useBaseSwitchSelection = createSelectionHook<SelectableSwitchItem>(SwitchSelectionContext);

// Props for our provider component
interface SwitchSelectionProviderProps {
  children: ReactNode;
}

// Extended context type with additional switch-specific state
interface ExtendedSwitchSelectionContextType {
  switchList: SelectableSwitchItem[];
  setSwitchList: React.Dispatch<React.SetStateAction<SelectableSwitchItem[]>>;
  selectedSwitches: SelectableSwitchItem[];
  handleSelectSwitch: (sw: SelectableSwitchItem, shiftKey: boolean, ctrlKey: boolean) => void;
  displayedSwitch: SelectableSwitchItem | null;
}

// Create a wrapper provider that includes the switch list state
export function SwitchSelectionProvider({ children }: SwitchSelectionProviderProps) {
  const [switchList, setSwitchList] = useState<SelectableSwitchItem[]>([]);
  
  return (
    <BaseSwitchSelectionProvider
      options={{ 
        idField: 'mesh_name',
        // Custom comparison function to match previous behavior
        compareFn: (a, b) => a.mesh_name === b.mesh_name
      }}
      items={switchList}
    >
      <SwitchSelectionExtendedProvider 
        switchList={switchList} 
        setSwitchList={setSwitchList}
      >
        {children}
      </SwitchSelectionExtendedProvider>
    </BaseSwitchSelectionProvider>
  );
}

// Additional provider component to add switch-specific context
interface SwitchSelectionExtendedProviderProps {
  children: ReactNode;
  switchList: SelectableSwitchItem[];
  setSwitchList: React.Dispatch<React.SetStateAction<SelectableSwitchItem[]>>;
}

// Context for the extended switch selection state
const ExtendedSwitchSelectionContext = createSelectionContext<ExtendedSwitchSelectionContextType>();

<<<<<<< HEAD
=======
function SwitchSelectionExtendedProvider({ 
  children, 
  switchList, 
  setSwitchList 
}: SwitchSelectionExtendedProviderProps) {
  // Use the base selection hook to get selection state
  const { 
    selectedItem,
    selectItem,
    // Other selection methods available but not used in this implementation
  } = useBaseSwitchSelection();
  
  // Provide backward compatible API for existing components
>>>>>>> a86234711916588ef584ca925316ddf2d73c9675
  const handleSelectSwitch = useCallback(
    (sw: SelectableSwitchItem, shiftKey: boolean, ctrlKey: boolean) => {
      startTransition(() => {
        selectItem(sw);
        // Multi-select functionality could be added here if needed
      });
    },
    [selectItem]
  );

  // Create the value for the extended context
  const value = {
    switchList,
    setSwitchList,
    selectedSwitches: selectedItem ? [selectedItem] : [],
    handleSelectSwitch,
    displayedSwitch: selectedItem || switchList[0] || null,
  };

  return (
    <ExtendedSwitchSelectionContext.Provider value={value}>
      {children}
    </ExtendedSwitchSelectionContext.Provider>
  );
}

// Hook to access the extended switch selection context
export function useSwitchSelection() {
  const context = React.useContext(ExtendedSwitchSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useSwitchSelection must be used within a SwitchSelectionProvider"
    );
  }
  return context;
}
