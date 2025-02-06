import { PlaneForm } from "@/components/form/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FileText,
  CuboidIcon as Cube,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function SwitchEditorScreen() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen p-4 flex flex-col">
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/3 flex flex-col gap-6">
          <div className="flex-[2] min-h-0">
            <SwitchList onBack={() => navigate("/")} />
          </div>
          <div className="flex-[1] min-h-0">
            <SwitchModelPreview />
          </div>
        </div>
        <div className="w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Settings className="w-6 h-6 mr-2" />
                Plane Form
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)] overflow-auto">
              <PlaneForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SwitchList({ onBack }: { onBack: () => void }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Switch List
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] overflow-auto">
        {/* Add switch list content here */}
      </CardContent>
    </Card>
  );
}

function SwitchModelPreview() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Cube className="w-6 h-6 mr-2" />
          Model Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full w-full bg-gray-100 rounded-lg">
          {/* Add 3D model preview here */}
        </div>
      </CardContent>
    </Card>
  );
}
