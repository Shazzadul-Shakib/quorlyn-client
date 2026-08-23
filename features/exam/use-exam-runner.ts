"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAttemptState, saveAnswer, sendEvents, sendHeartbeat, submitAttempt } from "./api";
import { ApiError } from "@/lib/api/errors";
import type { Attempt, ExamState, ProctorEventType, SubmissionCause } from "@/types/api";

const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_BACKOFF_MS = [2_000, 5_000, 10_000, 15_000];
const EVENT_FLUSH_MS = 5_000;
const EVENT_BATCH_MAX = 10;
const ANSWER_DEBOUNCE_MS = 400;
const ANSWER_RETRY_MS = 3_000;
const COUNTED_EVENTS: ProctorEventType[] = ["TAB_HIDDEN", "FULLSCREEN_EXIT"];

export type SaveStatus = "idle" | "pending" | "saved" | "error";
export type ConnectionState = "online" | "reconnecting";

export function useExamRunner(initial: ExamState) {
  const [started, setStarted] = useState(false);
  const [attempt, setAttemptState] = useState<Attempt>(initial.attempt);
  const [answers, setAnswers] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const saved of initial.answers) map[saved.questionId] = saved.selectedOptionIds;
    return map;
  });
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const [connection, setConnection] = useState<ConnectionState>("online");
  const [skewMs, setSkewMs] = useState(() => Date.parse(initial.attempt.serverTime) - Date.now());
  const [violationMessage, setViolationMessage] = useState<string | null>(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  const attemptRef = useRef(attempt);
  const finalizedRef = useRef(attempt.status === "SUBMITTED");
  const heartbeatFailuresRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBeatAtRef = useRef(0);
  const eventQueueRef = useRef<{ type: ProctorEventType; clientTime: string }[]>([]);
  const eventFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingSelectionsRef = useRef<Record<string, string[]>>({});

  // "Latest callback" refs: timers and listeners are registered once (see
  // the `started` effect below) but need to call the freshest closures, so
  // scheduling code below reads through these instead of the consts
  // directly — avoids both stale closures and forward-reference ordering
  // issues the React Compiler otherwise flags.
  const runHeartbeatRef = useRef<() => void>(() => {});
  const flushEventsRef = useRef<() => void>(() => {});
  const flushAnswerRef = useRef<(questionId: string) => void>(() => {});

  const setAttempt = useCallback((next: Attempt | ((prev: Attempt) => Attempt)) => {
    setAttemptState((prev) => {
      const value = typeof next === "function" ? (next as (p: Attempt) => Attempt)(prev) : next;
      attemptRef.current = value;
      return value;
    });
  }, []);

  const clearAllTimers = useCallback(() => {
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    if (eventFlushTimerRef.current) clearTimeout(eventFlushTimerRef.current);
    for (const timer of Object.values(saveTimersRef.current)) clearTimeout(timer);
    saveTimersRef.current = {};
  }, []);

  const completeFinalize = useCallback(
    (finalAttempt: Attempt) => {
      finalizedRef.current = true;
      clearAllTimers();
      if (typeof document !== "undefined" && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setAttempt(finalAttempt);
    },
    [clearAllTimers, setAttempt],
  );

  const finalizeFromPartial = useCallback(
    async (cause: SubmissionCause | null) => {
      if (finalizedRef.current) return;
      try {
        const state = await getAttemptState(attempt.id);
        completeFinalize(state.attempt);
      } catch {
        completeFinalize({ ...attemptRef.current, status: "SUBMITTED", submissionCause: cause });
      }
    },
    [attempt.id, completeFinalize],
  );

  const applyTiming = useCallback(
    (timing: {
      serverTime: string;
      deadlineAt: string;
      remainingMs: number;
      status: Attempt["status"];
      submissionCause: SubmissionCause | null;
    }) => {
      setSkewMs(Date.parse(timing.serverTime) - Date.now());
      setAttempt((prev) => ({
        ...prev,
        serverTime: timing.serverTime,
        deadlineAt: timing.deadlineAt,
        remainingMs: timing.remainingMs,
        status: timing.status,
        submissionCause: timing.submissionCause,
      }));
    },
    [setAttempt],
  );

  const scheduleHeartbeat = useCallback((delay: number) => {
    if (finalizedRef.current) return;
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setTimeout(() => runHeartbeatRef.current(), delay);
  }, []);

  const queueFlushEvents = useCallback(() => {
    if (!eventFlushTimerRef.current) {
      eventFlushTimerRef.current = setTimeout(() => flushEventsRef.current(), EVENT_FLUSH_MS);
    }
  }, []);

  const queueEvent = useCallback(
    (type: ProctorEventType) => {
      if (finalizedRef.current) return;
      eventQueueRef.current.push({ type, clientTime: new Date().toISOString() });
      if (eventQueueRef.current.length >= EVENT_BATCH_MAX) {
        flushEventsRef.current();
      } else {
        queueFlushEvents();
      }
    },
    [queueFlushEvents],
  );

  const flushEvents = useCallback(async () => {
    if (eventFlushTimerRef.current) {
      clearTimeout(eventFlushTimerRef.current);
      eventFlushTimerRef.current = null;
    }
    if (eventQueueRef.current.length === 0 || finalizedRef.current) return;
    const batch = eventQueueRef.current.splice(0, 50);
    const counted = batch.filter((event) => COUNTED_EVENTS.includes(event.type)).length;

    try {
      const result = await sendEvents(attempt.id, batch);
      applyTiming(result);
      if (counted > 0) {
        setViolationMessage(
          `Leaving the exam screen has been recorded — ${result.focusViolations}${
            result.maxFocusViolations !== null ? ` of ${result.maxFocusViolations}` : ""
          }.`,
        );
      }
      if (result.status === "SUBMITTED") {
        completeFinalize(result);
      }
    } catch {
      eventQueueRef.current.unshift(...batch);
      eventFlushTimerRef.current = setTimeout(() => flushEventsRef.current(), EVENT_FLUSH_MS);
    }
  }, [attempt.id, applyTiming, completeFinalize]);

  const runHeartbeat = useCallback(async () => {
    if (finalizedRef.current) return;
    try {
      const result = await sendHeartbeat(attempt.id);
      lastBeatAtRef.current = Date.now();
      const wasReconnecting = heartbeatFailuresRef.current > 0;
      heartbeatFailuresRef.current = 0;
      setConnection("online");
      applyTiming(result);
      if (wasReconnecting) queueEvent("RECONNECT");
      if (result.status === "SUBMITTED") {
        await finalizeFromPartial(result.submissionCause);
        return;
      }
      scheduleHeartbeat(HEARTBEAT_INTERVAL_MS);
    } catch {
      heartbeatFailuresRef.current += 1;
      setConnection("reconnecting");
      scheduleHeartbeat(
        HEARTBEAT_BACKOFF_MS[Math.min(heartbeatFailuresRef.current - 1, HEARTBEAT_BACKOFF_MS.length - 1)],
      );
    }
  }, [attempt.id, applyTiming, finalizeFromPartial, queueEvent, scheduleHeartbeat]);

  const flushAnswer = useCallback(
    async (questionId: string) => {
      if (finalizedRef.current) return;
      const value = pendingSelectionsRef.current[questionId] ?? [];
      try {
        await saveAnswer(attempt.id, questionId, value);
        setSaveStatus((prev) => ({ ...prev, [questionId]: "saved" }));
      } catch (error) {
        if (error instanceof ApiError && error.status === 410) {
          await finalizeFromPartial(null);
          return;
        }
        setSaveStatus((prev) => ({ ...prev, [questionId]: "error" }));
        saveTimersRef.current[questionId] = setTimeout(
          () => flushAnswerRef.current(questionId),
          ANSWER_RETRY_MS,
        );
      }
    },
    [attempt.id, finalizeFromPartial],
  );

  useEffect(() => {
    runHeartbeatRef.current = runHeartbeat;
  }, [runHeartbeat]);
  useEffect(() => {
    flushEventsRef.current = flushEvents;
  }, [flushEvents]);
  useEffect(() => {
    flushAnswerRef.current = flushAnswer;
  }, [flushAnswer]);

  const setAnswer = useCallback((questionId: string, selectedOptionIds: string[]) => {
    if (finalizedRef.current) return;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOptionIds }));
    pendingSelectionsRef.current[questionId] = selectedOptionIds;
    setSaveStatus((prev) => ({ ...prev, [questionId]: "pending" }));
    if (saveTimersRef.current[questionId]) clearTimeout(saveTimersRef.current[questionId]);
    saveTimersRef.current[questionId] = setTimeout(
      () => flushAnswerRef.current(questionId),
      ANSWER_DEBOUNCE_MS,
    );
  }, []);

  const submitManually = useCallback(async () => {
    if (finalizedRef.current) return;
    const result = await submitAttempt(attempt.id);
    completeFinalize(result);
  }, [attempt.id, completeFinalize]);

  const begin = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Best-effort — fullscreen can be refused; the loops still run.
    }
    setStarted(true);
  }, []);

  // Loops and listeners only run once the student has clicked "Begin", so
  // the fullscreen request always originates from that click.
  useEffect(() => {
    if (!started || finalizedRef.current) return;

    function onVisibilityChange() {
      if (document.hidden) {
        queueEvent("TAB_HIDDEN");
      } else if (Date.now() - lastBeatAtRef.current > 2000) {
        runHeartbeatRef.current();
      }
    }
    function onFullscreenChange() {
      const active = Boolean(document.fullscreenElement);
      setFullscreenActive(active);
      if (!active && !finalizedRef.current) queueEvent("FULLSCREEN_EXIT");
    }
    function onBlur() {
      queueEvent("WINDOW_BLUR");
    }
    function onFocus() {
      if (Date.now() - lastBeatAtRef.current > 2000) runHeartbeatRef.current();
    }
    function onCopy() {
      queueEvent("COPY");
    }
    function onPaste() {
      queueEvent("PASTE");
    }
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!finalizedRef.current) event.preventDefault();
    }
    function onOnline() {
      flushEventsRef.current();
      for (const [questionId, status] of Object.entries(saveStatus)) {
        if (status === "error") flushAnswerRef.current(questionId);
      }
      if (heartbeatFailuresRef.current > 0) runHeartbeatRef.current();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("online", onOnline);

    lastBeatAtRef.current = Date.now();
    setFullscreenActive(Boolean(document.fullscreenElement));
    scheduleHeartbeat(HEARTBEAT_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("online", onOnline);
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-registered only on `started`; scheduling reads through the latest-callback refs above
  }, [started]);

  useEffect(() => {
    if (!violationMessage) return;
    const timer = setTimeout(() => setViolationMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [violationMessage]);

  return {
    started,
    begin,
    attempt,
    questions: initial.questions,
    answers,
    setAnswer,
    saveStatus,
    connection,
    skewMs,
    violationMessage,
    fullscreenActive,
    submitManually,
  };
}
