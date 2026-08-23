import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMutate } from "@/lib/api/server";
import { apiErrorResponse } from "@/lib/api/route-handler";
import type { HeartbeatResponse } from "@/types/api";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/attempts/[id]/heartbeat">,
) {
  const { id } = await ctx.params;
  try {
    const result = await apiMutate<HeartbeatResponse>(`/attempts/${id}/heartbeat`, {
      method: "POST",
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
