import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("specialties").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // B-tree indexes for text field searches (firstName, lastName, city, degree)
    // These optimize ILIKE queries with 100K+ records
    firstNameIdx: index("idx_advocates_first_name").on(table.firstName),
    lastNameIdx: index("idx_advocates_last_name").on(table.lastName),
    cityIdx: index("idx_advocates_city").on(table.city),
    degreeIdx: index("idx_advocates_degree").on(table.degree),
    // Note: GIN index for specialties JSONB column is created via SQL
    // (Drizzle doesn't support USING GIN syntax in schema yet)
    // Run: CREATE INDEX idx_advocates_specialties_gin ON advocates USING GIN(specialties);
  })
);

export { advocates };
