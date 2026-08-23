"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createInvite,
  createInviteBatch,
  deleteInvite,
  rotateJoinCode,
  updateMember,
  updateOrganizationName,
} from "./api";
import { errorMessage } from "@/lib/api/errors";
import type { BatchInviteResponse, Invite, OrgRole, Permission } from "@/types/api";

export interface FormState {
  error?: string;
  notice?: string;
}

function readPermissions(formData: FormData): Permission[] {
  return formData.getAll("permissions").map(String) as Permission[];
}

export async function updateMemberAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const status = String(formData.get("status") ?? "ACTIVE") as "ACTIVE" | "SUSPENDED";

  try {
    if (role === "TEACHER") {
      await updateMember(id, {
        status,
        isOrgOwner: formData.get("isOrgOwner") === "on",
        permissions: readPermissions(formData),
      });
    } else {
      await updateMember(id, { status });
    }
  } catch (error) {
    return { error: errorMessage(error, "Could not update this member") };
  }

  revalidatePath("/app/organization/members");
  redirect("/app/organization/members");
}

export interface InviteFormState {
  error?: string;
  created?: Invite;
}

export async function createInviteAction(
  _prev: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "STUDENT") as OrgRole;

  try {
    const created = await createInvite({
      email,
      role,
      ...(role === "TEACHER"
        ? { isOrgOwner: formData.get("isOrgOwner") === "on", permissions: readPermissions(formData) }
        : {}),
    });
    revalidatePath("/app/organization/invites");
    return { created };
  } catch (error) {
    return { error: errorMessage(error, "Could not send this invite") };
  }
}

export interface BatchInviteFormState {
  error?: string;
  result?: BatchInviteResponse;
}

export async function createInviteBatchAction(
  _prev: BatchInviteFormState,
  formData: FormData,
): Promise<BatchInviteFormState> {
  const raw = String(formData.get("emails") ?? "");
  const emails = [...new Set(raw.split(/[\s,]+/).map((e) => e.trim()).filter(Boolean))];
  const role = String(formData.get("role") ?? "STUDENT") as OrgRole;

  if (emails.length === 0) {
    return { error: "Enter at least one email address." };
  }

  try {
    const result = await createInviteBatch({
      emails,
      role,
      ...(role === "TEACHER"
        ? { isOrgOwner: formData.get("isOrgOwner") === "on", permissions: readPermissions(formData) }
        : {}),
    });
    revalidatePath("/app/organization/invites");
    return { result };
  } catch (error) {
    return { error: errorMessage(error, "Could not send these invites") };
  }
}

export async function revokeInviteAction(inviteId: string): Promise<void> {
  await deleteInvite(inviteId);
  revalidatePath("/app/organization/invites");
}

export async function updateOrgNameAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  try {
    await updateOrganizationName(name);
  } catch (error) {
    return { error: errorMessage(error, "Could not update the organization name") };
  }
  revalidatePath("/app/organization/settings");
  return { notice: "Saved." };
}

export async function rotateJoinCodeAction(): Promise<{ joinCode: string } | { error: string }> {
  try {
    const organization = await rotateJoinCode();
    revalidatePath("/app/organization/settings");
    return { joinCode: organization.joinCode };
  } catch (error) {
    return { error: errorMessage(error, "Could not rotate the join code") };
  }
}
