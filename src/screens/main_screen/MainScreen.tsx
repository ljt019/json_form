import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { FileManagement } from "./components/file-management";
import { ModelPreview } from "./components/model-preview-card";
import { InfoPane } from "./components/info-pane-card";
import { LoadingCard } from "@/components/loading";

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
      <Suspense fallback={<LoadingCard />}>
        <MainScreenContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export function MainScreenContent() {
  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col">
          <FileManagement />
        </div>
        <div className="w-2/3 flex flex-col gap-6">
          <div className="flex-1 min-h-0">
            <Suspense fallback={<LoadingCard />}>
              <ModelPreview />
            </Suspense>
          </div>
          <div className="h-1/3 max-h-64">
            <Suspense fallback={<LoadingCard />}>
              <InfoPane />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
