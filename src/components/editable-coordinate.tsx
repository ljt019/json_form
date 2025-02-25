import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditableCoordinateProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  className?: string;
}

export function EditableCoordinate({
  value,
  onChange,
  label,
  min,
  max,
  step = 0.01,
  precision = 2,
  disabled = false,
  className = "",
}: EditableCoordinateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toFixed(precision));

  const formatValue = useCallback(
    (val: number) => val.toFixed(precision),
    [precision]
  );

  // Reset tempValue whenever value prop changes or editing state changes
  useEffect(() => {
    setTempValue(formatValue(value));
  }, [value, isEditing, formatValue]);

  const handleBlur = () => {
    setIsEditing(false);
    let newValue = Number.parseFloat(tempValue);

    if (!isNaN(newValue)) {
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);

      // Only trigger onChange if the value is valid and actually different
      if (Math.abs(newValue - value) > Math.pow(10, -precision)) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTempValue(formatValue(value)); // Reset to original value
    }
  };

  if (disabled) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <Label className="text-xs font-medium">{label}:</Label>
        <span className="text-xs text-muted-foreground">
          {formatValue(value)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Label className="text-xs font-medium">{label}:</Label>
      {isEditing ? (
        <Input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-20 h-6 px-1 py-0 text-xs"
          autoFocus
          min={min}
          max={max}
          step={step}
        />
      ) : (
        <span
          className="text-xs cursor-pointer hover:underline"
          onClick={() => setIsEditing(true)}
        >
          {formatValue(value)}
        </span>
      )}
    </div>
  );
}
