import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TokenUsageCardProps = {
  tokenUsageMillions: number;
};

function formatTokenUsage(tokenUsageMillions: number) {
  const totalTokens = Math.round(tokenUsageMillions * 1_000_000);

  return {
    millionsLabel: tokenUsageMillions.toFixed(4),
    totalTokensLabel: totalTokens.toLocaleString(),
  };
}

export function TokenUsageCard({ tokenUsageMillions }: TokenUsageCardProps) {
  const { millionsLabel, totalTokensLabel } =
    formatTokenUsage(tokenUsageMillions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-foreground/80">
        <p>
          <span className="font-semibold text-foreground">{millionsLabel}</span>{" "}
          million tokens
        </p>
        <p>
          Approx total:{" "}
          <span className="font-semibold text-foreground">
            {totalTokensLabel}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
