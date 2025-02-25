import { EditableCoordinate, EditableCoordinateProps } from "@/components/editable-coordinate";

export interface Coordinates3D {
  x: number;
  y: number;
  z: number;
}

export interface CoordinateGroupProps {
  coordinates: Coordinates3D;
  onChange: (coordinates: Coordinates3D) => void;
  onChangeX?: (value: number) => void;
  onChangeY?: (value: number) => void;
  onChangeZ?: (value: number) => void;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  precision?: number;
  step?: number;
  labels?: {
    x?: string;
    y?: string;
    z?: string;
  };
}

export function CoordinateGroup({
  coordinates,
  onChange,
  onChangeX,
  onChangeY,
  onChangeZ,
  className = "",
  disabled = false,
  min,
  max,
  precision = 2,
  step = 0.01,
  labels = { x: "X", y: "Y", z: "Z" },
}: CoordinateGroupProps) {
  // Common props for all coordinate inputs
  const commonProps: Partial<EditableCoordinateProps> = {
    disabled,
    min,
    max,
    precision,
    step,
  };

  // Handler for X coordinate change
  const handleXChange = (value: number) => {
    if (onChangeX) {
      onChangeX(value);
    }
    
    if (onChange) {
      onChange({ ...coordinates, x: value });
    }
  };

  // Handler for Y coordinate change
  const handleYChange = (value: number) => {
    if (onChangeY) {
      onChangeY(value);
    }
    
    if (onChange) {
      onChange({ ...coordinates, y: value });
    }
  };

  // Handler for Z coordinate change
  const handleZChange = (value: number) => {
    if (onChangeZ) {
      onChangeZ(value);
    }
    
    if (onChange) {
      onChange({ ...coordinates, z: value });
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <EditableCoordinate 
        value={coordinates.x} 
        onChange={handleXChange} 
        label={labels.x || "X"} 
        {...commonProps}
      />
      <EditableCoordinate 
        value={coordinates.y} 
        onChange={handleYChange} 
        label={labels.y || "Y"} 
        {...commonProps}
      />
      <EditableCoordinate 
        value={coordinates.z} 
        onChange={handleZChange} 
        label={labels.z || "Z"} 
        {...commonProps}
      />
    </div>
  );
}