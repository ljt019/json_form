import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { FolderOpen } from "lucide-react";

export function OpenOutputDirButton() {
  function openPlaneConfigFolder() {
    invoke("open_plane_config_folder");
  }

  return (
    <Button
      onClick={openPlaneConfigFolder}
      variant="outline"
      className="transition-all duration-200 hover:scale-105"
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      Open Config Directory
    </Button>
  );
}
