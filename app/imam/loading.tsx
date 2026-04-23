import { Loader2 } from "lucide-react";

export default function ImamLoading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center p-8">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading Imam dashboard…</span>
      </div>
    </div>
  );
}
