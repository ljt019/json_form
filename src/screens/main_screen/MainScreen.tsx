import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { FileManagement } from "./components/file-management";
import { ModelPreview } from "./components/model-preview-card";
import { InfoPane } from "./components/info-pane-card";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useParsedGLBData } from "@/hooks/queries/useParsedGLBData";

export function MainScreen() {
  return (
    <ErrorBoundary
      fallback={
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full text-destructive">
            something went wrong loading the main screen.
          </CardContent>
        </Card>
      }
    >
      <Suspense
        fallback={
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              loading main screen...
            </CardContent>
          </Card>
        }
      >
        <MainScreenContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function MainScreenContent() {
  const { data: planeData } = useGetSelectedConfigData();
  const modelPath = planeData?.modelPath ?? "";
  const { data: parsedData } = useParsedGLBData(modelPath);

  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col">
          <FileManagement />
        </div>
        <div className="w-2/3 flex flex-col gap-6">
          {modelPath ? (
            <>
              <div className="flex-1 min-h-0">
                <Suspense
                  fallback={
                    <Card className="h-full">
                      <CardContent className="flex items-center justify-center h-full">
                        loading model preview...
                      </CardContent>
                    </Card>
                  }
                >
                  <ModelPreview blobUrl={parsedData.blobUrl} />
                </Suspense>
              </div>
              <div className="h-1/3 max-h-64">
                <Suspense
                  fallback={
                    <Card className="h-full">
                      <CardContent className="flex items-center justify-center h-full">
                        loading plane info...
                      </CardContent>
                    </Card>
                  }
                >
                  <InfoPane
                    planeData={planeData}
                    switches={parsedData.switches}
                  />
                </Suspense>
              </div>
            </>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full text-muted-foreground">
                please select or create a plane configuration.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
