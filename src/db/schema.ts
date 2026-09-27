import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export type StoredOrderItem = {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
};

export const dressOrders = pgTable(
  "dress_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    lineItems: jsonb("line_items").$type<StoredOrderItem[]>().notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("dress_orders_email_idx").on(table.email)],
);

export const dressSubscribers = pgTable(
  "dress_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("dress_subscribers_email_unique").on(table.email)],
);
