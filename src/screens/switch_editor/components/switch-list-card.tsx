import { Suspense, useMemo } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { usePlaneModel } from "@/hooks/usePlaneModel";
import { useSwitchSelection } from "@/hooks/useSwitchSelection";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";
import { LoadingCard } from "@/components/loading";
import { SelectableList } from "@/components/selectable-list";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent } from "@/components/ui/card";

interface SwitchListContentProps {
  onBack: () => void;
}

function SwitchListContent({ onBack }: SwitchListContentProps) {
  const { data: planeData } = useGetSelectedConfigData();
  const { data: parsedData } = useLoadPlaneModelData(planeData.modelPath);
  const { modelError } = usePlaneModel({ parsedData });
  const { switchList, selectedSwitches, handleSelectSwitch } =
    useSwitchSelection();

  // Calculate configured switches
  const configuredCount = useMemo(
    () => switchList.filter((item) => item.isConfigured).length,
    [switchList]
  );

  if (modelError) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-destructive">
          <p>error loading 3d model: {modelError}</p>
          <p className="text-muted-foreground">
            model path: {planeData.modelPath || "not provided"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <SelectableList
      items={switchList}
      selectedItems={selectedSwitches}
      onSelect={handleSelectSwitch}
      title="switch list"
      icon={<FileText className="w-6 h-6 mr-2" />}
      onBack={onBack}
      searchPlaceholder="search switches..."
      renderItem={(item, isSelected) => (
        <div className="flex items-center justify-between w-full">
          <span>{item.name}</span>
          {item.isConfigured ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      )}
      footerContent={(filteredItems) => (
        <p className="text-sm text-muted-foreground">
          {configuredCount} out of {switchList.length} switches configured
        </p>
      )}
    />
  );
}

interface SwitchListProps {
  onBack: () => void;
}

export function SwitchList({ onBack }: SwitchListProps) {
  return (
    <div className="flex-[1.5] min-h-0">
      <Suspense fallback={<LoadingCard />}>
        <ErrorBoundary>
          <SwitchListContent onBack={onBack} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
