import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMutate } from "@/lib/api/server";
import { apiErrorResponse } from "@/lib/api/route-handler";
import type { Attempt } from "@/types/api";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/attempts/[id]/submit">,
) {
  const { id } = await ctx.params;
  try {
    const result = await apiMutate<Attempt>(`/attempts/${id}/submit`, { method: "POST" });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
