import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NewFileButtonProps {
  onNewFile: () => void;
}

export function NewFileButton({ onNewFile }: NewFileButtonProps) {
  return (
    <Button
      onClick={onNewFile}
      className="transition-all duration-200 hover:scale-105"
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      New Plane
    </Button>
  );
}
