import { toApiError } from "@/lib/api/errors";
import type { Attempt, ExamState, HeartbeatResponse, ProctorEventType } from "@/types/api";

/** Client-side calls, all against our own Route Handlers — never the backend directly. */

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const payload: unknown = text.length > 0 ? JSON.parse(text) : undefined;
  if (!response.ok) throw toApiError(response.status, payload);
  return payload as T;
}

/** Re-reads the authoritative state — used to resolve the score after a
 * heartbeat or autosave reports the attempt finalized without carrying it. */
export async function getAttemptState(attemptId: string): Promise<ExamState> {
  const response = await fetch(`/api/attempts/${attemptId}`);
  return parse<ExamState>(response);
}

export async function sendHeartbeat(attemptId: string): Promise<HeartbeatResponse> {
  const response = await fetch(`/api/attempts/${attemptId}/heartbeat`, { method: "POST" });
  return parse<HeartbeatResponse>(response);
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionIds: string[],
): Promise<void> {
  const response = await fetch(`/api/attempts/${attemptId}/answers/${questionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedOptionIds }),
  });
  return parse<void>(response);
}

export async function sendEvents(
  attemptId: string,
  events: { type: ProctorEventType; clientTime: string }[],
): Promise<Attempt> {
  const response = await fetch(`/api/attempts/${attemptId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });
  return parse<Attempt>(response);
}

export async function submitAttempt(attemptId: string): Promise<Attempt> {
  const response = await fetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
  return parse<Attempt>(response);
}
