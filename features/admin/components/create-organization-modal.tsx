"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { CreateOrganizationForm } from "./create-organization-form";

export function CreateOrganizationModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconPlus width={16} height={16} />
        New organization
      </Button>
      {open ? (
        <Modal
          title="Create an organization"
          description="The owner signs in with this email once the organization exists."
          onClose={() => setOpen(false)}
        >
          <CreateOrganizationForm />
        </Modal>
      ) : null}
    </>
  );
}
