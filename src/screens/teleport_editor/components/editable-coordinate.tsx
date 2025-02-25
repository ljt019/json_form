import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditableCoordinateProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function EditableCoordinate({
  value,
  onChange,
  label,
}: EditableCoordinateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toFixed(2));

  // Reset tempValue whenever value prop changes or editing state changes
  useEffect(() => {
    setTempValue(value.toFixed(2));
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const newValue = Number.parseFloat(tempValue);

    // Only trigger onChange if the value is valid and actually different
    if (!isNaN(newValue) && Math.abs(newValue - value) > 0.001) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Label className="text-xs font-medium">{label}:</Label>
      {isEditing ? (
        <Input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-16 h-6 px-1 py-0 text-xs"
          autoFocus
        />
      ) : (
        <span
          className="text-xs cursor-pointer hover:underline"
          onClick={() => setIsEditing(true)}
        >
          {value.toFixed(2)}
        </span>
      )}
    </div>
  );
}
