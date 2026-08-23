import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMutate } from "@/lib/api/server";
import { apiErrorResponse } from "@/lib/api/route-handler";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/attempts/[id]/answers/[questionId]">,
) {
  const { id, questionId } = await ctx.params;
  const body: unknown = await request.json();
  try {
    await apiMutate<void>(`/attempts/${id}/answers/${questionId}`, { method: "PUT", body });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
