import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMutate } from "@/lib/api/server";
import { apiErrorResponse } from "@/lib/api/route-handler";
import type { Attempt } from "@/types/api";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/attempts/[id]/events">,
) {
  const { id } = await ctx.params;
  const body: unknown = await request.json();
  try {
    const result = await apiMutate<Attempt>(`/attempts/${id}/events`, { method: "POST", body });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
