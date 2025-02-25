import { EditableCoordinate } from "@/screens/teleport_editor/components/editable-coordinate";

export interface CoordinateGroupProps {
  x: number;
  y: number;
  z: number;
  onChangeX: (value: number) => void;
  onChangeY: (value: number) => void;
  onChangeZ: (value: number) => void;
  className?: string;
}

export function CoordinateGroup({
  x,
  y,
  z,
  onChangeX,
  onChangeY,
  onChangeZ,
  className = "",
}: CoordinateGroupProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <EditableCoordinate value={x} onChange={onChangeX} label="X" />
      <EditableCoordinate value={y} onChange={onChangeY} label="Y" />
      <EditableCoordinate value={z} onChange={onChangeZ} label="Z" />
    </div>
  );
}