import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, XCircle, Info } from "lucide-react";

export type ErrorLevel = "error" | "warning" | "info";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  level?: ErrorLevel;
  retry?: () => void;
  dismiss?: () => void;
  details?: string | Record<string, any>;
  showDetails?: boolean;
}

const levelConfig = {
  error: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

export function ErrorCard({
  title = "Error",
  message = "An unexpected error occurred",
  level = "error",
  retry,
  dismiss,
  details,
  showDetails = false,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(showDetails);
  const { icon: Icon, color, bgColor, borderColor } = levelConfig[level];

  // Format error details for display
  const formattedDetails = React.useMemo(() => {
    if (!details) return "";

    if (typeof details === "string") {
      return details;
    }

    try {
      return JSON.stringify(details, null, 2);
    } catch (e) {
      return `${details}`;
    }
  }, [details]);

  return (
    <Card className={`border ${borderColor} ${bgColor} overflow-hidden`}>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 ${color}`}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm">{message}</p>

        {details && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto mt-2 text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide details" : "Show details"}
            </Button>

            {isExpanded && (
              <pre className="text-xs mt-2 p-2 bg-muted rounded-md overflow-auto max-h-[200px]">
                {formattedDetails}
              </pre>
            )}
          </>
        )}
      </CardContent>

      {(retry || dismiss) && (
        <CardFooter className="flex justify-end gap-2 pt-2">
          {retry && (
            <Button size="sm" variant="outline" onClick={retry}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}

          {dismiss && (
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Dismiss
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export function createError(
  message: string,
  details?: any,
  level: ErrorLevel = "error"
): {
  message: string;
  details?: any;
  level: ErrorLevel;
  timestamp: number;
} {
  return {
    message,
    details,
    level,
    timestamp: Date.now(),
  };
}
