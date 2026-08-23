import { api } from "@/lib/api/server";
import type { OrganizationDashboard, StudentDashboard, TeacherDashboard } from "@/types/api";

export async function getTeacherDashboard(): Promise<TeacherDashboard> {
  return api<TeacherDashboard>("/dashboard/teacher?mine=true");
}

export async function getStudentDashboard(): Promise<StudentDashboard> {
  return api<StudentDashboard>("/dashboard/student");
}

export async function getOrganizationDashboard(range?: {
  from: string;
  to: string;
}): Promise<OrganizationDashboard> {
  const query = range
    ? `?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    : "";
  return api<OrganizationDashboard>(`/dashboard/organization${query}`);
}
