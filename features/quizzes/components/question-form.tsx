"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateQuestionAction } from "../actions";
import type { QuestionInput, QuestionOptionInput } from "../api";
import { ContentEditor } from "./content-editor";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { IconTrash, IconPlus, IconCheck } from "@/components/ui/icons";
import { errorMessage } from "@/lib/api/errors";
import type { AnswerKeyQuestion, QuestionType } from "@/types/api";

const TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Single choice",
  MULTI_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / False",
};

let localId = 0;
function nextLocalId() {
  localId += 1;
  return `local-${localId}`;
}

interface OptionState {
  key: string;
  text: string;
  isCorrect: boolean;
}

function blankOptions(): OptionState[] {
  return [
    { key: nextLocalId(), text: "", isCorrect: false },
    { key: nextLocalId(), text: "", isCorrect: false },
  ];
}

function initialOptions(question?: AnswerKeyQuestion): OptionState[] {
  if (!question) return blankOptions();
  return question.options
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((o) => ({ key: o.id, text: o.text, isCorrect: o.isCorrect }));
}

export function QuestionForm({
  quizId,
  question,
  onDone,
  onCancel,
  onAdd,
}: {
  quizId: string;
  question?: AnswerKeyQuestion;
  onDone: () => void;
  onCancel?: () => void;
  /** Creating a question is optimistic (see `QuestionList`) — this hands the
   * validated input to the parent, which shows it in the list immediately
   * and only reports back (via a toast) if the save turns out to fail. */
  onAdd?: (input: QuestionInput) => void;
}) {
  const isEditing = Boolean(question);
  const [type, setType] = useState<QuestionType>(question?.type ?? "SINGLE_CHOICE");
  const [points, setPoints] = useState(question?.points ?? 1);
  const [prompt, setPrompt] = useState(question?.prompt ?? "");
  const [options, setOptions] = useState<OptionState[]>(() => initialOptions(question));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // A fresh "add" form (or one just opened to edit) should be ready to type
  // into immediately — one less click than clicking into the prompt field.
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  // The form resets to blank in place after a successful add rather than
  // closing, so this transient confirmation is the only cue that the
  // previous question actually saved.
  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function changeType(next: QuestionType) {
    setType(next);
    if (next === "TRUE_FALSE") {
      setOptions([
        { key: nextLocalId(), text: "True", isCorrect: true },
        { key: nextLocalId(), text: "False", isCorrect: false },
      ]);
    } else if (options.length < 2) {
      setOptions(blankOptions());
    }
  }

  function updateOptionText(key: string, text: string) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));
  }

  function setSingleCorrect(key: string) {
    setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.key === key })));
  }

  function toggleCorrect(key: string) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, isCorrect: !o.isCorrect } : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, { key: nextLocalId(), text: "", isCorrect: false }]);
  }

  function removeOption(key: string) {
    setOptions((prev) => (prev.length > 2 ? prev.filter((o) => o.key !== key) : prev));
  }

  function submit() {
    if (!prompt.trim()) {
      setError("Prompt is required.");
      return;
    }
    const cleanOptions: QuestionOptionInput[] = options
      .filter((o) => o.text.trim().length > 0)
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));
    if (cleanOptions.length < 2) {
      setError("At least two options are required.");
      return;
    }
    if (!cleanOptions.some((o) => o.isCorrect)) {
      setError("Mark at least one correct answer.");
      return;
    }

    const hasMath = prompt.includes("$") || cleanOptions.some((o) => o.text.includes("$"));
    const input: QuestionInput = {
      type,
      prompt: prompt.trim(),
      contentFormat: hasMath ? "LATEX_MIXED" : "PLAIN",
      points,
      options: cleanOptions,
    };

    setError(null);

    if (question) {
      startTransition(async () => {
        try {
          await updateQuestionAction(quizId, question.id, input);
          onDone();
        } catch (cause) {
          setError(errorMessage(cause, "Could not save this question"));
        }
      });
      return;
    }

    // Creating is optimistic: hand off to the parent (which shows it in the
    // list right away and reports a failure via toast) and reset immediately
    // rather than waiting on the network — that's the whole point.
    onAdd?.(input);
    // Stay open and reset to blank instead of collapsing — adding a
    // whole quiz's worth of questions is the common case, and closing
    // after every single one meant re-clicking "Add question" each time.
    // Type is deliberately preserved: a run of same-type questions
    // (common — a block of MCQs) shouldn't need reselecting each time.
    setPoints(1);
    setPrompt("");
    setOptions(
      type === "TRUE_FALSE"
        ? [
            { key: nextLocalId(), text: "True", isCorrect: true },
            { key: nextLocalId(), text: "False", isCorrect: false },
          ]
        : blankOptions(),
    );
    promptRef.current?.focus();
    setJustAdded(true);
  }

  return (
    <div className="space-y-5">
      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="q-type">
          <Select id="q-type" value={type} onChange={(event) => changeType(event.target.value as QuestionType)}>
            {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Points" htmlFor="q-points">
          <Input
            id="q-points"
            type="number"
            min={1}
            value={points}
            onChange={(event) => setPoints(Math.max(1, Number(event.target.value) || 1))}
          />
        </Field>
      </div>

      <ContentEditor
        id="q-prompt"
        label="Prompt"
        value={prompt}
        onChange={setPrompt}
        rows={3}
        required
        fieldRef={(el) => {
          promptRef.current = el;
        }}
      />

      <div className="space-y-2">
        <p className="text-fg text-sm font-medium">
          Options{" "}
          {type === "MULTI_CHOICE" ? "(check every correct answer)" : "(select the correct answer)"}
        </p>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.key} className="flex items-start gap-2">
              <input
                type={type === "MULTI_CHOICE" ? "checkbox" : "radio"}
                checked={option.isCorrect}
                onChange={() =>
                  type === "MULTI_CHOICE" ? toggleCorrect(option.key) : setSingleCorrect(option.key)
                }
                className="accent-primary mt-2.5 h-4 w-4 shrink-0"
                aria-label="Mark as correct"
              />
              <div className="min-w-0 flex-1">
                <ContentEditor
                  id={`q-option-${option.key}`}
                  ariaLabel="Option text"
                  value={option.text}
                  onChange={(text) => updateOptionText(option.key, text)}
                  disabled={type === "TRUE_FALSE"}
                  placeholder="Option text"
                  compact
                />
              </div>
              {type !== "TRUE_FALSE" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.key)}
                  disabled={options.length <= 2}
                  aria-label="Remove option"
                  className="mt-0.5 shrink-0"
                >
                  <IconTrash />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {type !== "TRUE_FALSE" ? (
          <Button type="button" variant="secondary" size="sm" onClick={addOption}>
            <IconPlus />
            Add option
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        {justAdded ? (
          <span className="text-success-fg mr-auto flex items-center gap-1 text-sm">
            <IconCheck width={15} height={15} />
            Added — write the next one, or press Done.
          </span>
        ) : null}
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            {isEditing ? "Cancel" : "Done"}
          </Button>
        ) : null}
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : isEditing ? "Save question" : "Add question"}
        </Button>
      </div>
    </div>
  );
}
