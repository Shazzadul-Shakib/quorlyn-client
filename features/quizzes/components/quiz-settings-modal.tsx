"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IconSettings } from "@/components/ui/icons";
import { QuizSettingsForm } from "./quiz-settings-form";
import type { Quiz } from "@/types/api";

export function QuizSettingsModal({ quiz }: { quiz: Quiz }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <IconSettings width={15} height={15} />
        Settings
      </Button>
      {open ? (
        <Modal
          title="Quiz settings"
          description="Timing, scoring, and visibility."
          onClose={() => setOpen(false)}
          size="lg"
        >
          <QuizSettingsForm quiz={quiz} />
        </Modal>
      ) : null}
    </>
  );
}
