import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { QuizStatus } from "@/types/api";

const TONE: Record<QuizStatus, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CLOSED: "warning",
  ARCHIVED: "neutral",
};

const LABEL: Record<QuizStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export function QuizStatusBadge({ status }: { status: QuizStatus }) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
