import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";

import { SwitchItem } from "@/screens/switch_editor/SwitchEditorScreen";

interface SwitchListProps {
  onBack: () => void;
  switchList: SwitchItem[];
  selectedSwitches: SwitchItem[];
  onSelectSwitch: (
    switchItem: SwitchItem,
    shiftKey: boolean,
    ctrlKey: boolean
  ) => void;
  modelError: string | null;
  modelPath: string;
}

export function SwitchList({
  onBack,
  switchList,
  selectedSwitches,
  onSelectSwitch,
  modelError,
  modelPath,
}: SwitchListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSwitchList = useMemo(
    () =>
      switchList.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [switchList, searchTerm]
  );

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
            model path: {modelPath || "not provided"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            switch list
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="search switches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <div className="px-4 py-2">
            {filteredSwitchList.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                {searchTerm
                  ? "no matches found."
                  : "no switches found in the model."}
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredSwitchList.map((item, index) => {
                  const isSelected = selectedSwitches.some(
                    (s) => s.name === item.name
                  );
                  return (
                    <li
                      key={index}
                      className={`py-2 px-3 rounded-md select-none cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={(e) =>
                        onSelectSwitch(item, e.shiftKey, e.ctrlKey)
                      }
                    >
                      <span>{item.name}</span>
                      {item.isConfigured ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
        <div className="px-4 py-2 mt-auto">
          <p className="text-sm text-muted-foreground">
            {configuredCount} out of {switchList.length} switches configured
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
