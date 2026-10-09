import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
  boolean,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  originCity: text("origin_city"),
  passportStatus: text("passport_status"),
  dateOfBirth: timestamp("date_of_birth"),
  favoritePlaces: text("favorite_places").default("[]").notNull(), // JSON: string[] of liked place names
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  destinationLat: doublePrecision("destination_lat"),
  destinationLng: doublePrecision("destination_lng"),
  countryCode: text("country_code"),
  originCity: text("origin_city"), // where this trip starts from — used for AI transport suggestions
  aiTravelNotes: text("ai_travel_notes"), // JSON: {toDestination, backHome} — AI-suggested, unverified
  aiRouteLogistics: text("ai_route_logistics"), // AI-written route/transport narrative
  aiBudgetBreakdown: text("ai_budget_breakdown"), // JSON: [{category, details, costRange}]
  aiTotalBudgetRange: text("ai_total_budget_range"),
  aiTips: text("ai_tips"), // JSON: string[]
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budgetTotal: doublePrecision("budget_total"),
  currency: text("currency").default("INR").notNull(),
  travelStyle: text("travel_style"),
  pace: text("pace"),
  interests: text("interests").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripDays = pgTable("trip_days", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  tripId: varchar("trip_id", { length: 191 }).notNull().references(() => trips.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: text("title"), // AI-suggested day title, e.g. "Arrival & Old City exploration"
  date: timestamp("date"),
});

export const itineraryItems = pgTable("itinerary_items", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  tripDayId: varchar("trip_day_id", { length: 191 }).notNull().references(() => tripDays.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  placeName: text("place_name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  sourceUrl: text("source_url"), // nullable — AI-generated/curated places have no real source link
  extract: text("extract"),
  estimatedArrival: text("estimated_arrival"),
  notes: text("notes"),
});

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  tripId: varchar("trip_id", { length: 191 }).notNull().references(() => trips.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  category: text("category").notNull(),
  sourceUrl: text("source_url"),
  done: boolean("done").default(false).notNull(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  tripId: varchar("trip_id", { length: 191 }).notNull().references(() => trips.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("INR").notNull(),
  plannedOrActual: text("planned_or_actual").default("planned").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetCodes = pgTable("password_reset_codes", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, { fields: [trips.userId], references: [users.id] }),
  days: many(tripDays),
  checklistItems: many(checklistItems),
  expenses: many(expenses),
}));

export const tripDaysRelations = relations(tripDays, ({ one, many }) => ({
  trip: one(trips, { fields: [tripDays.tripId], references: [trips.id] }),
  items: many(itineraryItems),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  tripDay: one(tripDays, { fields: [itineraryItems.tripDayId], references: [tripDays.id] }),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  trip: one(trips, { fields: [checklistItems.tripId], references: [trips.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, { fields: [expenses.tripId], references: [trips.id] }),
}));
