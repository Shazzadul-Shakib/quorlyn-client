"use client";

import { useActionState, useState } from "react";
import { updateDraftSettingsAction, updatePublishedSettingsAction, type FormState } from "../actions";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/types/api";

const INITIAL: FormState = {};

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function QuizSettingsForm({ quiz }: { quiz: Quiz }) {
  const isDraft = quiz.status === "DRAFT";
  const action = isDraft
    ? updateDraftSettingsAction.bind(null, quiz.id)
    : updatePublishedSettingsAction.bind(null, quiz.id);
  const [state, formAction] = useActionState(action, INITIAL);
  // Controlled only so a *set* opens/closes-at date can be forced back to
  // full contrast — the browser dims a datetime-local's whole editable
  // region by default (see globals.css) since it can't otherwise tell "no
  // date chosen" from "a date is chosen" text apart when unfocused.
  const [opensAt, setOpensAt] = useState(() => toLocalInput(quiz.opensAt));
  const [closesAt, setClosesAt] = useState(() => toLocalInput(quiz.closesAt));

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.notice ? <Alert tone="success">{state.notice}</Alert> : null}

      <Field label="Title" htmlFor="title" required>
        <Input id="title" name="title" defaultValue={quiz.title} required />
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={quiz.description ?? ""} rows={2} />
      </Field>

      {isDraft ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Language" htmlFor="language">
              <Select id="language" name="language" defaultValue={quiz.language}>
                <option value="EN">English</option>
                <option value="BN">Bangla</option>
                <option value="MIXED">Mixed</option>
              </Select>
            </Field>
            <Field label="Subject" htmlFor="subject">
              <Input id="subject" name="subject" defaultValue={quiz.subject ?? ""} />
            </Field>
          </div>

          <Field label="Duration (minutes)" htmlFor="durationSeconds" hint="How long one sitting lasts." required>
            <Input
              id="durationSeconds"
              name="durationSeconds"
              type="number"
              min={1}
              defaultValue={Math.round(quiz.durationSeconds / 60)}
              required
            />
          </Field>
        </>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Opens at" htmlFor="opensAt" hint="When the quiz starts accepting sittings.">
          <Input
            id="opensAt"
            name="opensAt"
            type="datetime-local"
            value={opensAt}
            onChange={(event) => setOpensAt(event.target.value)}
            className={cn(opensAt && "[&::-webkit-datetime-edit]:text-fg")}
          />
        </Field>
        <Field label="Closes at" htmlFor="closesAt" hint="When the quiz stops accepting sittings.">
          <Input
            id="closesAt"
            name="closesAt"
            type="datetime-local"
            value={closesAt}
            onChange={(event) => setClosesAt(event.target.value)}
            className={cn(closesAt && "[&::-webkit-datetime-edit]:text-fg")}
          />
        </Field>
      </div>

      {isDraft ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Max attempts" htmlFor="maxAttempts">
            <Input id="maxAttempts" name="maxAttempts" type="number" min={1} defaultValue={quiz.maxAttempts} />
          </Field>
          <Field label="Scoring policy" htmlFor="scoringPolicy" hint="Which attempt represents the student.">
            <Select id="scoringPolicy" name="scoringPolicy" defaultValue={quiz.scoringPolicy}>
              <option value="BEST">Best</option>
              <option value="FIRST">First</option>
              <option value="LATEST">Latest</option>
            </Select>
          </Field>
        </div>
      ) : null}

      <Field label="Max focus violations" htmlFor="maxFocusViolations" hint="Leave blank for no limit.">
        <Input
          id="maxFocusViolations"
          name="maxFocusViolations"
          type="number"
          min={0}
          defaultValue={quiz.maxFocusViolations ?? ""}
        />
      </Field>

      <Checkbox
        name="leaderboardVisibleToStudents"
        label="Leaderboard visible to students"
        defaultChecked={quiz.leaderboardVisibleToStudents}
      />

      {isDraft ? (
        <>
          <Checkbox
            name="lateStartCutoff"
            label="Refuse a late start"
            description="Don't let a student begin if they wouldn't get the full duration before closesAt."
            defaultChecked={quiz.lateStartCutoff}
          />
          <Checkbox
            name="shuffleQuestions"
            label="Shuffle questions per attempt"
            description="Each attempt gets its own question and option order."
            defaultChecked={quiz.shuffleQuestions}
          />
        </>
      ) : null}

      <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
    </form>
  );
}
