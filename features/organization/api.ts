import { api, apiMutate } from "@/lib/api/server";
import type {
  BatchInviteResponse,
  Invite,
  InviteStatus,
  Member,
  OrgRole,
  Organization,
  Paginated,
  Permission,
  MembershipStatus,
} from "@/types/api";

export async function getCurrentOrganization(): Promise<Organization> {
  return api<Organization>("/organizations/current");
}

export async function listMembers(params: {
  role?: OrgRole;
  page?: number;
  limit?: number;
}): Promise<Paginated<Member>> {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return api<Paginated<Member>>(`/members?${query.toString()}`);
}

export async function getMember(id: string): Promise<Member> {
  return api<Member>(`/members/${id}`);
}

export async function updateMember(
  id: string,
  patch: { permissions?: Permission[]; isOrgOwner?: boolean; status?: MembershipStatus },
): Promise<Member> {
  return apiMutate<Member>(`/members/${id}`, { method: "PATCH", body: patch });
}

export async function createInvite(input: {
  email: string;
  role: OrgRole;
  isOrgOwner?: boolean;
  permissions?: Permission[];
}): Promise<Invite> {
  return apiMutate<Invite>("/invites", { method: "POST", body: input });
}

export async function createInviteBatch(input: {
  emails: string[];
  role: OrgRole;
  isOrgOwner?: boolean;
  permissions?: Permission[];
}): Promise<BatchInviteResponse> {
  return apiMutate<BatchInviteResponse>("/invites/batch", { method: "POST", body: input });
}

export async function listInvites(params: {
  status?: InviteStatus;
  page?: number;
  limit?: number;
}): Promise<Invite[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return api<Invite[]>(`/invites?${query.toString()}`);
}

export async function deleteInvite(id: string): Promise<void> {
  return apiMutate<void>(`/invites/${id}`, { method: "DELETE" });
}

export async function updateOrganizationName(name: string): Promise<Organization> {
  return apiMutate<Organization>("/organizations/current", { method: "PATCH", body: { name } });
}

export async function rotateJoinCode(): Promise<Organization> {
  return apiMutate<Organization>("/organizations/current/rotate-join-code", { method: "POST" });
}
