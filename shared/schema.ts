import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  phone: text("phone"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

// Categories
export const supplierCategories = pgTable("supplier_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupplierCategorySchema = createInsertSchema(supplierCategories).omit({
  id: true,
  createdAt: true,
});

export const drawerCategories = pgTable("drawer_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDrawerCategorySchema = createInsertSchema(drawerCategories).omit({
  id: true,
  createdAt: true,
});

export const kachaUserCategories = pgTable("kacha_user_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKachaUserCategorySchema = createInsertSchema(kachaUserCategories).omit({
  id: true,
  createdAt: true,
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  categoryId: integer("category_id").references(() => supplierCategories.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

// Workflow Stages
// 1. Purchase Management
export const rawMaterialPurchases = pgTable("raw_material_purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  materialName: text("material_name").notNull(),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  pricePerUnit: numeric("price_per_unit").notNull(),
  totalPrice: numeric("total_price").notNull(),
  invoiceNumber: text("invoice_number"),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRawMaterialPurchaseSchema = createInsertSchema(rawMaterialPurchases).omit({
  id: true,
  createdAt: true,
});

// 2. Kacha Copper Processing
export const kachaProcessing = pgTable("kacha_processing", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => rawMaterialPurchases.id),
  processorId: integer("processor_id").references(() => users.id),
  categoryId: integer("category_id").references(() => kachaUserCategories.id),
  inputQuantity: numeric("input_quantity").notNull(),
  outputQuantity: numeric("output_quantity").notNull(),
  wastage: numeric("wastage"),
  processDate: timestamp("process_date").notNull().defaultNow(),
  status: text("status").notNull().default("in_progress"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKachaProcessingSchema = createInsertSchema(kachaProcessing).omit({
  id: true,
  createdAt: true,
});

// 3. Draw Process
export const drawProcess = pgTable("draw_process", {
  id: serial("id").primaryKey(),
  kachaId: integer("kacha_id").references(() => kachaProcessing.id),
  categoryId: integer("category_id").references(() => drawerCategories.id),
  drawOperatorId: integer("draw_operator_id").references(() => users.id),
  inputQuantity: numeric("input_quantity").notNull(),
  outputQuantity: numeric("output_quantity").notNull(),
  wireSize: text("wire_size").notNull(),
  wastage: numeric("wastage"),
  processDate: timestamp("process_date").notNull().defaultNow(),
  status: text("status").notNull().default("in_progress"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDrawProcessSchema = createInsertSchema(drawProcess).omit({
  id: true,
  createdAt: true,
});

// 4. Ready Copper
export const readyCopper = pgTable("ready_copper", {
  id: serial("id").primaryKey(),
  drawId: integer("draw_id").references(() => drawProcess.id),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  wireSize: text("wire_size").notNull(),
  qualityGrade: text("quality_grade"),
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date").notNull().defaultNow(),
  storageLocation: text("storage_location"),
  status: text("status").notNull().default("ready"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReadyCopperSchema = createInsertSchema(readyCopper).omit({
  id: true,
  createdAt: true,
});

// 5. PVC Purchase
export const pvcPurchases = pgTable("pvc_purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  materialType: text("material_type").notNull(),
  color: text("color"),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  pricePerUnit: numeric("price_per_unit").notNull(),
  totalPrice: numeric("total_price").notNull(),
  invoiceNumber: text("invoice_number"),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPvcPurchaseSchema = createInsertSchema(pvcPurchases).omit({
  id: true,
  createdAt: true,
});

// 6. Production
export const production = pgTable("production", {
  id: serial("id").primaryKey(),
  readyCopperId: integer("ready_copper_id").references(() => readyCopper.id),
  pvcId: integer("pvc_id").references(() => pvcPurchases.id),
  productName: text("product_name").notNull(),
  wireSize: text("wire_size").notNull(),
  color: text("color"),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  productionCost: numeric("production_cost").notNull(),
  sellingPrice: numeric("selling_price").notNull(),
  profit: numeric("profit"),
  productionDate: timestamp("production_date").notNull().defaultNow(),
  status: text("status").notNull().default("in_production"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductionSchema = createInsertSchema(production).omit({
  id: true,
  createdAt: true,
});

// Transaction History
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionType: text("transaction_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity"),
  amount: numeric("amount"),
  performedBy: integer("performed_by").references(() => users.id),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// OTP
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOtpSchema = createInsertSchema(otps).omit({
  id: true,
  isUsed: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSupplierCategory = z.infer<typeof insertSupplierCategorySchema>;
export type SupplierCategory = typeof supplierCategories.$inferSelect;

export type InsertDrawerCategory = z.infer<typeof insertDrawerCategorySchema>;
export type DrawerCategory = typeof drawerCategories.$inferSelect;

export type InsertKachaUserCategory = z.infer<typeof insertKachaUserCategorySchema>;
export type KachaUserCategory = typeof kachaUserCategories.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertRawMaterialPurchase = z.infer<typeof insertRawMaterialPurchaseSchema>;
export type RawMaterialPurchase = typeof rawMaterialPurchases.$inferSelect;

export type InsertKachaProcessing = z.infer<typeof insertKachaProcessingSchema>;
export type KachaProcessing = typeof kachaProcessing.$inferSelect;

export type InsertDrawProcess = z.infer<typeof insertDrawProcessSchema>;
export type DrawProcess = typeof drawProcess.$inferSelect;

export type InsertReadyCopper = z.infer<typeof insertReadyCopperSchema>;
export type ReadyCopper = typeof readyCopper.$inferSelect;

export type InsertPvcPurchase = z.infer<typeof insertPvcPurchaseSchema>;
export type PvcPurchase = typeof pvcPurchases.$inferSelect;

export type InsertProduction = z.infer<typeof insertProductionSchema>;
export type Production = typeof production.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Otp = typeof otps.$inferSelect;
