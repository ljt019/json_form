import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { NewFileButton } from "@/screens/main_screen/components/new-file-button";
import { ExistingFilesList } from "@/screens/main_screen/components/existing-files-list";
import { OpenOutputDirButton } from "@/screens/main_screen/components/open-output-dir-button";

export function FileManagement() {
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Plane Configs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <NewFileButton onNewFile={() => setIsCreatingNewFile(true)} />
          <OpenOutputDirButton />
        </div>
        <ExistingFilesList
          isCreatingNewFile={isCreatingNewFile}
          onNewFileCreated={() => setIsCreatingNewFile(false)}
        />
      </CardContent>
    </Card>
  );
}
