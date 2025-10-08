// import db from "../../../db";
// import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import type { AdvocatesResponse } from "../../../types/advocate";

export async function GET(): Promise<Response> {
  // TODO: Uncomment in PR 2 to use database
  // const data = await db.select().from(advocates);

  const data = advocateData;

  const response: AdvocatesResponse = { data };

  return Response.json(response);
}
