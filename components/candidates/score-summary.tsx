import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateApplicationDetail } from "@/lib/candidates/queries";

type ScoreSummaryProps = {
  score: NonNullable<CandidateApplicationDetail["score"]>;
};

function recommendationVariant(recommendation: string) {
  switch (recommendation) {
    case "STRONG_MATCH":
      return "default" as const;
    case "MATCH":
      return "secondary" as const;
    case "BORDERLINE":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

export function ScoreSummary({ score }: ScoreSummaryProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal">AI screening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-mono text-3xl tracking-tight sm:text-4xl">
              {Math.round(score.finalScore)}%
            </p>
            <Badge variant={recommendationVariant(score.recommendation)}>
              {score.recommendation.replace(/_/g, " ")}
            </Badge>
          </div>

          {score.reasoning && (
            <p className="text-sm text-muted-foreground">{score.reasoning}</p>
          )}

          {score.mandatoryFailures.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">Mandatory requirement failures</p>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                {score.mandatoryFailures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Matched skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {score.matchedSkills.length ? (
                  score.matchedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None listed</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Missing skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {score.missingSkills.length ? (
                  score.missingSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None listed</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {score.criterionScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg font-normal">
              Criterion breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {score.criterionScores.map((criterion) => (
                <li key={criterion.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{criterion.criterionName}</p>
                      <p className="text-xs text-muted-foreground">
                        Weight {criterion.criterionWeight}%
                      </p>
                    </div>
                    <p className="font-mono text-sm">
                      {Math.round(criterion.score)} / {Math.round(criterion.maximumScore)}
                    </p>
                  </div>
                  {criterion.reasoning && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {criterion.reasoning}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
