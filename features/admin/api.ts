import { api } from "@/lib/api/server";
import { apiMutate } from "@/lib/api/server";
import type {
  Organization,
  Paginated,
  PlatformStats,
  PlatformUser,
  PlatformUserDetail,
} from "@/types/api";

export async function listOrganizations(page = 1, limit = 20): Promise<Paginated<Organization>> {
  return api<Paginated<Organization>>(`/organizations?page=${page}&limit=${limit}`);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return api<PlatformStats>("/admin/stats");
}

export async function listUsers(
  page = 1,
  limit = 20,
  q?: string,
): Promise<Paginated<PlatformUser>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set("q", q);
  return api<Paginated<PlatformUser>>(`/admin/users?${params.toString()}`);
}

export async function getUser(id: string): Promise<PlatformUserDetail> {
  return api<PlatformUserDetail>(`/admin/users/${id}`);
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
