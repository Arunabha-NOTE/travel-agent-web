import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TokenUsageCardProps = {
  tokenUsageMillions: number;
  totalTokens?: number;
  totalCost?: number;
};

export function TokenUsageCard({
  tokenUsageMillions,
  totalTokens,
  totalCost,
}: TokenUsageCardProps) {
  const millionsLabel = tokenUsageMillions.toFixed(4);
  const totalTokensLabel = (
    totalTokens ?? Math.round(tokenUsageMillions * 1_000_000)
  ).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-foreground/80">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Total Tokens
            </p>
            <p className="text-lg font-bold text-foreground">
              {totalTokensLabel}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Estimated Cost
            </p>
            <p className="text-lg font-bold text-blue-500">
              ${totalCost?.toFixed(4) ?? "0.0000"}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-muted-foreground">
            Usage in millions:{" "}
            <span className="text-foreground font-mono">{millionsLabel}M</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
