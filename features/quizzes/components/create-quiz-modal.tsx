"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { CreateQuizForm } from "./create-quiz-form";

export function CreateQuizModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconPlus width={16} height={16} />
        Create quiz
      </Button>
      {open ? (
        <Modal
          title="Create a quiz"
          description="Add questions, options, and formulas on the next page."
          onClose={() => setOpen(false)}
        >
          <CreateQuizForm />
        </Modal>
      ) : null}
    </>
  );
}
