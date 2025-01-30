import { useState } from "react";
import { useGetExistingFiles } from "@/hooks/queries/useGetExistingFiles";
import { useGetSelectedFile } from "@/hooks/queries/useGetSelectedFile";
import useSetCurrentFile from "@/hooks/mutations/useSetCurrentFile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Check, Loader2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { removeJsonExtension } from "@/lib/utils";

interface ExistingFilesListProps {
  isCreatingNewFile: boolean;
  onNewFileCreated: () => void;
}

interface NewFileEntryProps {
  fileName: string;
  onFileNameChange: (fileName: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

interface FileListProps {
  files: string[];
  selectedFile: string | undefined;
}

interface FileListEntryProps {
  file: string;
  isSelected: boolean;
}

export function ExistingFilesList({
  isCreatingNewFile,
  onNewFileCreated,
}: ExistingFilesListProps) {
  const { data: files, refetch } = useGetExistingFiles();
  const { data: selectedFile } = useGetSelectedFile();
  const [newFileName, setNewFileName] = useState("");

  const handleCreateNewFile = async () => {
    if (newFileName.trim()) {
      const fullFileName = newFileName.trim().endsWith(".json")
        ? newFileName.trim()
        : `${newFileName.trim()}.json`;
      await invoke("create_new_file", { fileName: fullFileName });
      setNewFileName("");
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
            onFileNameChange={setNewFileName}
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
  onFileNameChange,
  onSubmit,
  onCancel,
}: NewFileEntryProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => onFileNameChange(e.target.value)}
      />
      <Button onClick={onSubmit}>Create</Button>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

function FileList({ files, selectedFile }: FileListProps) {
  return (
    <>
      {files.map((file) => (
        <FileListEntry
          key={file}
          file={file}
          isSelected={selectedFile !== undefined && file === selectedFile}
        />
      ))}
    </>
  );
}

function FileListEntry({ file, isSelected }: FileListEntryProps) {
  const setCurrentFile = useSetCurrentFile();

  const handleSetCurrentFile = () => {
    setCurrentFile.mutate(file);
  };

  return (
    <div className="flex items-center justify-between bg-muted p-2 rounded-md">
      <span className="flex items-center text-foreground">
        <File className="mr-2 h-4 w-4" />
        <span className="truncate">{removeJsonExtension(file)}</span>
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
  );
}
