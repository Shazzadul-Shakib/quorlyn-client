import { RenderedContent } from "@/components/math/rendered-content";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnswerKeyQuestion, GradedAnswer } from "@/types/api";

export function GradedAnswers({
  questions,
  answers,
}: {
  questions: AnswerKeyQuestion[];
  answers: GradedAnswer[];
}) {
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));
  const sorted = questions.slice().sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-5">
      {sorted.map((question, index) => {
        const answer = answerByQuestion.get(question.id);
        const selected = new Set(answer?.selectedOptionIds ?? []);

        return (
          <div key={question.id} className="border-border border-b pb-4 last:border-0 last:pb-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-fg-subtle text-xs font-medium">Q{index + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-fg-subtle text-xs">
                  {question.points} pt{question.points === 1 ? "" : "s"}
                </span>
                {answer && answer.isCorrect !== null ? (
                  <Badge tone={answer.isCorrect ? "success" : "danger"}>
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                    {answer.pointsAwarded !== null
                      ? ` · ${answer.pointsAwarded} pt${answer.pointsAwarded === 1 ? "" : "s"}`
                      : ""}
                  </Badge>
                ) : (
                  <Badge tone="neutral">Not answered</Badge>
                )}
              </div>
            </div>

            <RenderedContent value={question.prompt} format={question.contentFormat} className="mb-2" />

            <ul className="space-y-1">
              {question.options
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((option) => {
                  const wasSelected = selected.has(option.id);
                  return (
                    <li
                      key={option.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1 text-sm",
                        option.isCorrect && "bg-success-soft",
                        wasSelected && !option.isCorrect && "bg-danger-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          option.isCorrect
                            ? "bg-success"
                            : wasSelected
                              ? "bg-danger"
                              : "bg-border-strong",
                        )}
                      />
                      <RenderedContent value={option.text} format={question.contentFormat} />
                      {wasSelected ? (
                        <span className="text-fg-subtle ml-auto shrink-0 text-xs">selected</span>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
