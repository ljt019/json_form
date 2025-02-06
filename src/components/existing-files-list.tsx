import { useState } from "react";
import { useGetExistingFiles } from "@/hooks/queries/useGetExistingFiles";
import { useGetSelectedFile } from "@/hooks/queries/useGetSelectedFile";
import useSetCurrentFile from "@/hooks/mutations/useSetCurrentFile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Check, Loader2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

// Utility to remove .json extension.
export function removeJsonExtension(fileName: string) {
  return fileName.replace(/\.json$/i, "");
}

interface ExistingFilesListProps {
  isCreatingNewFile: boolean;
  onNewFileCreated: () => void;
}

interface NewFileEntryProps {
  fileName: string;
  modelPath: string;
  onFileNameChange: (fileName: string) => void;
  onModelPathChange: (modelPath: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

interface FileListProps {
  files: { file_name: string; model_path: string }[];
  selectedFile: string | undefined;
}

interface FileListEntryProps {
  file: { file_name: string; model_path: string };
  isSelected: boolean;
}

export function ExistingFilesList({
  isCreatingNewFile,
  onNewFileCreated,
}: ExistingFilesListProps) {
  const { data: files, refetch } = useGetExistingFiles();
  const { data: selectedFile } = useGetSelectedFile();
  const [newFileName, setNewFileName] = useState("");
  const [newModelPath, setNewModelPath] = useState("");

  const handleCreateNewFile = async () => {
    if (newFileName.trim() && newModelPath.trim()) {
      // Remove any .json extension from the plane name input since the API appends it automatically.
      const planeName = newFileName.trim().replace(/\.json$/i, "");
      const modelFilePath = newModelPath.trim();

      await invoke("create_new_config_file", { planeName, modelFilePath });
      setNewFileName("");
      setNewModelPath("");
      onNewFileCreated();
      refetch();
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow rounded-lg pr-6 pb-6 pt-6">
      <h2 className="text-xl font-semibold mb-4">Existing Configs</h2>
      <div className="space-y-2">
        {isCreatingNewFile && (
          <NewFileEntry
            fileName={newFileName}
            modelPath={newModelPath}
            onFileNameChange={setNewFileName}
            onModelPathChange={setNewModelPath}
            onSubmit={handleCreateNewFile}
            onCancel={onNewFileCreated}
          />
        )}
        {files && files.length > 0 ? (
          <FileList files={files} selectedFile={selectedFile} />
        ) : (
          <p className="text-muted-foreground">
            No configs found. *Press the new plane config button to create a new
            one*
          </p>
        )}
      </div>
    </div>
  );
}

function NewFileEntry({
  fileName,
  modelPath,
  onFileNameChange,
  onModelPathChange,
  onSubmit,
  onCancel,
}: NewFileEntryProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter plane name"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter model file path"
          value={modelPath}
          onChange={(e) => onModelPathChange(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={onSubmit}>Create</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function FileList({ files, selectedFile }: FileListProps) {
  return (
    <>
      {files.map((file) => (
        <FileListEntry
          key={file.file_name}
          file={file}
          isSelected={
            selectedFile !== undefined && file.file_name === selectedFile
          }
        />
      ))}
    </>
  );
}

function FileListEntry({ file, isSelected }: FileListEntryProps) {
  const setCurrentFile = useSetCurrentFile();

  const handleSetCurrentFile = () => {
    setCurrentFile.mutate(file.file_name);
  };

  return (
    <div className="flex flex-col bg-muted p-2 rounded-md">
      <div className="flex items-center justify-between">
        <span className="flex items-center text-foreground">
          <Plane className="mr-2 h-4 w-4" />
          <span className="truncate">
            {removeJsonExtension(file.file_name)}
          </span>
        </span>
        <Button
          variant={isSelected ? "secondary" : "outline"}
          size="sm"
          className="ml-2"
          onClick={handleSetCurrentFile}
          disabled={setCurrentFile.isPending}
        >
          {setCurrentFile.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            "Set as Current"
          )}
        </Button>
      </div>
      <div className="mt-1 ml-6">
        <span className="text-sm text-muted-foreground italic">
          {file.model_path}
        </span>
      </div>
    </div>
  );
}
