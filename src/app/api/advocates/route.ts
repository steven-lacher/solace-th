import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, sql } from "drizzle-orm";
import type { Advocate } from "../../../types/advocate";

interface PaginatedResponse {
  data: Advocate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  try {
    // Build search conditions once (avoids type issues with query mutation)
    const searchConditions = search
      ? or(
          ilike(advocates.firstName, `%${search}%`),
          ilike(advocates.lastName, `%${search}%`),
          ilike(advocates.city, `%${search}%`),
          ilike(advocates.degree, `%${search}%`),
          // Note: JSONB search on specialties array - converts to text for search
          sql`${advocates.specialties}::text ILIKE ${`%${search}%`}`
        )
      : undefined;

    // Get total count for pagination
    const countResult = searchConditions
      ? await db.select({ count: sql<number>`count(*)` }).from(advocates).where(searchConditions)
      : await db.select({ count: sql<number>`count(*)` }).from(advocates);

    const total = Number(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    // Build and execute main query with pagination
    const query = searchConditions
      ? db.select().from(advocates).where(searchConditions).limit(limit).offset(offset)
      : db.select().from(advocates).limit(limit).offset(offset);

    const data = await query;

    const response: PaginatedResponse = {
      data,
      total,
      page,
      limit,
      totalPages,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
