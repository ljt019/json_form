import { useState } from "react";
import { NewFileButton } from "./new-file-button";
import { ExistingFilesList } from "./existing-files-list";
import { OpenOutputDirButton } from "./open-output-dir-button";

export function FileManagement() {
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        Plane Config Files
      </h1>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <NewFileButton onNewFile={() => setIsCreatingNewFile(true)} />
          <OpenOutputDirButton />
        </div>
        <ExistingFilesList
          isCreatingNewFile={isCreatingNewFile}
          onNewFileCreated={() => setIsCreatingNewFile(false)}
        />
      </div>
    </div>
  );
}
