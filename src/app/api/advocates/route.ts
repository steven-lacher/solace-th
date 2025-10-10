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
    // Check if user is searching specifically for years of experience
    // Examples: "3 years", "15 yrs", "5 years of experience"
    // Returns advocates with AT LEAST that many years (minimum threshold)
    const yearsMatch = search.match(/^(\d+)\s*(year|yr|yrs|years)(\s+of\s+experience)?$/i);

    // Build search conditions once (avoids type issues with query mutation)
    const searchConditions = search
      ? yearsMatch
        ? // If searching for years, return advocates with AT LEAST that many years
          sql`${advocates.yearsOfExperience} >= ${parseInt(yearsMatch[1], 10)}`
        : // Otherwise, search all text fields
          or(
            ilike(advocates.firstName, `%${search}%`),
            ilike(advocates.lastName, `%${search}%`),
            ilike(advocates.city, `%${search}%`),
            ilike(advocates.degree, `%${search}%`),
            // Phone number search - convert to text for partial matching
            sql`${advocates.phoneNumber}::text ILIKE ${`%${search}%`}`,
            // Years of experience search - convert to text for partial matching
            sql`${advocates.yearsOfExperience}::text ILIKE ${`%${search}%`}`,
            // JSONB search on specialties array - converts to text for search
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

    const results = await query;

    // Cast types to match Advocate interface
    const data: Advocate[] = results.map((advocate) => ({
      ...advocate,
      specialties: advocate.specialties as string[],
      createdAt: advocate.createdAt ?? undefined,
    }));

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
