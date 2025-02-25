import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { SwitchList } from "@/screens/switch_editor/components/switch-list-card";
import { SwitchModelPreview } from "@/screens/switch_editor/components/switch-model-preview-card";
import { PlaneForm } from "@/screens/switch_editor/components/form/form";
import { ErrorCard } from "@/components/error";
import { LoadingCard } from "@/components/loading";
import { SwitchSelectionProvider } from "@/hooks/useSwitchSelection";
import { ErrorBoundary } from "@/components/error-boundary";

export function SwitchEditorScreen() {
  const navigate = useNavigate();

  return (
    <SwitchSelectionProvider>
      <div className="w-full min-h-screen p-4 flex flex-col">
        <div className="flex flex-1 gap-6 min-h-0">
          <div className="w-1/3 flex flex-col gap-6 h-[calc(100vh-2rem)]">
            <ErrorBoundary fallback={<ErrorCard />}>
              <Suspense fallback={<LoadingCard />}>
                <SwitchList onBack={() => navigate("/")} />
                <SwitchModelPreview />
              </Suspense>
            </ErrorBoundary>
          </div>
          <div className="w-2/3">
            <ErrorBoundary fallback={<ErrorCard />}>
              <Suspense fallback={<LoadingCard />}>
                <PlaneForm />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </SwitchSelectionProvider>
  );
}
