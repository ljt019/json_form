import { Card, CardContent } from "@/components/ui/card";

export function LoadingCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <Loading />
      </CardContent>
    </Card>
  );
}

export function Loading() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  );
}
