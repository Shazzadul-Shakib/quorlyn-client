import type { Permission } from "@/types/api";

export const PERMISSION_LABEL: Record<Permission, string> = {
  MANAGE_MEMBERS: "Manage members",
  MANAGE_QUIZZES: "Manage quizzes",
  VIEW_RESULTS: "View results",
  MANAGE_ORGANIZATION: "Manage organization",
};
