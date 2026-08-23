"use server";

import { revalidatePath } from "next/cache";
import { createOrganization, setOrganizationStatus } from "./api";
import { errorMessage } from "@/lib/api/errors";
import type { Organization } from "@/types/api";

export interface CreateOrganizationState {
  error?: string;
  created?: Organization;
}

export async function createOrganizationAction(
  _prev: CreateOrganizationState,
  formData: FormData,
): Promise<CreateOrganizationState> {
  const name = String(formData.get("name") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim();

  if (!name || !ownerEmail) {
    return { error: "Name and owner email are required." };
  }

  try {
    const created = await createOrganization({ name, ownerEmail });
    revalidatePath("/app/admin/organizations");
    return { created };
  } catch (error) {
    return { error: errorMessage(error, "Could not create the organization") };
  }
}

export async function setOrganizationStatusAction(
  organizationId: string,
  isActive: boolean,
): Promise<void> {
  await setOrganizationStatus(organizationId, isActive);
  revalidatePath("/app/admin/organizations");
  revalidatePath("/app");
}
