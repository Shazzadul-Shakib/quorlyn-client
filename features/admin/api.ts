import { api } from "@/lib/api/server";
import { apiMutate } from "@/lib/api/server";
import type { Organization, Paginated, PlatformStats } from "@/types/api";

export async function listOrganizations(page = 1, limit = 20): Promise<Paginated<Organization>> {
  return api<Paginated<Organization>>(`/organizations?page=${page}&limit=${limit}`);
}

/**
 * Platform-wide aggregates only — counts, never who's in an organization or
 * what their details are. Individual member/user lookups are deliberately
 * not exposed to the superadmin; that visibility belongs to each
 * organization's own owners/admins (see `features/organization`).
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  return api<PlatformStats>("/admin/stats");
}

export async function createOrganization(input: {
  name: string;
  ownerEmail: string;
}): Promise<Organization> {
  return apiMutate<Organization>("/organizations", { method: "POST", body: input });
}

export async function setOrganizationStatus(
  id: string,
  isActive: boolean,
): Promise<Organization> {
  return apiMutate<Organization>(`/organizations/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}
