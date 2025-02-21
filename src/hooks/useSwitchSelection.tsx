import { useState, startTransition } from "react";
import { SwitchItem } from "@/types";

interface UseSwitchSelectionProps {
  switchList: SwitchItem[];
}

export function useSwitchSelection({ switchList }: UseSwitchSelectionProps) {
  const initialSelectedSwitch = switchList.length > 0 ? [switchList[0]] : [];
  const [selectedSwitches, setSelectedSwitches] = useState<SwitchItem[]>(
    initialSelectedSwitch
  );
  const [anchorIndex, setAnchorIndex] = useState<number>(
    switchList.length > 0 ? 0 : -1
  );

  const handleSelectSwitch = (
    sw: SwitchItem,
    shiftKey: boolean,
    ctrlKey: boolean
  ) => {
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
  };

  const handleShiftSelection = (currentIndex: number) => {
    if (anchorIndex !== -1) {
      const start = Math.min(anchorIndex, currentIndex);
      const end = Math.max(anchorIndex, currentIndex);
      const range = switchList.slice(start, end + 1);
      setSelectedSwitches(range);
    } else {
      setSelectedSwitches([switchList[currentIndex]]);
    }
    setAnchorIndex(currentIndex);
  };

  const handleCtrlSelection = (sw: SwitchItem, currentIndex: number) => {
    setSelectedSwitches((prev) => {
      const exists = prev.find((s) => s.name === sw.name);
      return exists ? prev.filter((s) => s.name !== sw.name) : [...prev, sw];
    });
    setAnchorIndex(currentIndex);
  };

  const handleSingleSelection = (sw: SwitchItem, currentIndex: number) => {
    setSelectedSwitches([sw]);
    setAnchorIndex(currentIndex);
  };

  return {
    selectedSwitches,
    handleSelectSwitch,
    displayedSwitch: selectedSwitches[0] ?? switchList[0] ?? null,
  };
}
