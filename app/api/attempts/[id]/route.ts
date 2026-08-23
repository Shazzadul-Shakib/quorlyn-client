import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMutate } from "@/lib/api/server";
import { apiErrorResponse } from "@/lib/api/route-handler";
import type { ExamState } from "@/types/api";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/attempts/[id]">) {
  const { id } = await ctx.params;
  try {
    const result = await apiMutate<ExamState>(`/attempts/${id}`);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
