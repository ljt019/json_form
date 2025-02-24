import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Sliders, Sparkles } from "lucide-react";
import { ParsedSwitchItem } from "@/hooks/queries/useLoadPlaneModelData";
import { FullConfigFile } from "@/hooks/queries/useGetSelectedConfigData";
import { LoadingCard } from "@/components/loading";
import { useGetSelectedConfigData } from "@/hooks/queries/useGetSelectedConfigData";
import { useLoadPlaneModelData } from "@/hooks/queries/useLoadPlaneModelData";

interface SwitchInfoProps {
  planeData: FullConfigFile;
  switches: ParsedSwitchItem[];
}

function SwitchInfo({ planeData, switches }: SwitchInfoProps) {
  const totalSwitches = switches.length;
  const configuredSwitches = switches.filter((s) =>
    Object.keys(planeData.switches || {}).includes(s.prettyName)
  ).length;

  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-semibold">Switches:</span>
        <div className="flex items-center">
          {totalSwitches > 0 ? (
            configuredSwitches === totalSwitches ? (
              <div className="flex items-center text-green-500">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span>
                  Configured ({configuredSwitches} of {totalSwitches})
                </span>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <XCircle className="w-5 h-5 mr-1" />
                <span>
                  Configured ({configuredSwitches} of {totalSwitches})
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center text-red-500">
              <XCircle className="w-5 h-5 mr-1" />
              <span>No switches found</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Model Path:</span>
        <span className="italic">{planeData.modelPath}</span>
      </div>
      <Separator />
    </div>
  );
}

export function InfoPane() {
  const navigate = useNavigate();
  const { data: planeData } = useGetSelectedConfigData();
  const modelPath = planeData?.modelPath ?? "";
  const { data: parsedData } = useLoadPlaneModelData(modelPath);

  if (!modelPath) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          Please select or create a plane configuration.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {planeData.planeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-5rem)] justify-between">
        <Suspense fallback={<LoadingCard />}>
          <SwitchInfo planeData={planeData} switches={parsedData.switches} />
        </Suspense>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate("/switchEditor")}
            className="w-full mt-4"
            size="lg"
          >
            <Sliders className="w-5 h-5 mr-2" />
            Configure Switches
          </Button>
          <Button
            onClick={() => navigate("/teleportEditor")}
            className="w-full mt-4"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Configure Teleports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
