import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSupplierCategorySchema, 
  insertDrawerCategorySchema, 
  insertKachaUserCategorySchema,
  insertSupplierSchema,
  insertRawMaterialPurchaseSchema,
  insertKachaProcessingSchema,
  insertDrawProcessSchema,
  insertReadyCopperSchema,
  insertPvcPurchaseSchema,
  insertProductionSchema,
  insertTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Category Management Routes
  
  // Supplier Categories
  app.get("/api/supplier-categories", async (req, res, next) => {
    try {
      const categories = await storage.getSupplierCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/supplier-categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getSupplierCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Supplier category not found" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/supplier-categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertSupplierCategorySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parseResult.error.errors });
      }
      
      const category = await storage.createSupplierCategory(parseResult.data);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/supplier-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertSupplierCategorySchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parseResult.error.errors });
      }
      
      const updatedCategory = await storage.updateSupplierCategory(id, parseResult.data);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Supplier category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/supplier-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplierCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Supplier category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Drawer Categories
  app.get("/api/drawer-categories", async (req, res, next) => {
    try {
      const categories = await storage.getDrawerCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/drawer-categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getDrawerCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Drawer category not found" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/drawer-categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertDrawerCategorySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parseResult.error.errors });
      }
      
      const category = await storage.createDrawerCategory(parseResult.data);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/drawer-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertDrawerCategorySchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parseResult.error.errors });
      }
      
      const updatedCategory = await storage.updateDrawerCategory(id, parseResult.data);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Drawer category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/drawer-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteDrawerCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Drawer category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Kacha User Categories
  app.get("/api/kacha-user-categories", async (req, res, next) => {
    try {
      const categories = await storage.getKachaUserCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/kacha-user-categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getKachaUserCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Kacha user category not found" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/kacha-user-categories", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertKachaUserCategorySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parseResult.error.errors });
      }
      
      const category = await storage.createKachaUserCategory(parseResult.data);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/kacha-user-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertKachaUserCategorySchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parseResult.error.errors });
      }
      
      const updatedCategory = await storage.updateKachaUserCategory(id, parseResult.data);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Kacha user category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/kacha-user-categories/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteKachaUserCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Kacha user category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Supplier Management Routes
  app.get("/api/suppliers", async (req, res, next) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/suppliers/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/suppliers/category/:categoryId", async (req, res, next) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const suppliers = await storage.getSuppliersByCategory(categoryId);
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/suppliers", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertSupplierSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid supplier data", errors: parseResult.error.errors });
      }
      
      const supplier = await storage.createSupplier(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "create",
        entityType: "supplier",
        entityId: supplier.id,
        description: `Created supplier: ${supplier.name}`,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/suppliers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertSupplierSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid supplier data", errors: parseResult.error.errors });
      }
      
      const updatedSupplier = await storage.updateSupplier(id, parseResult.data);
      
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "supplier",
        entityId: updatedSupplier.id,
        description: `Updated supplier: ${updatedSupplier.name}`,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedSupplier);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/suppliers/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      const success = await storage.deleteSupplier(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete supplier" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "delete",
        entityType: "supplier",
        entityId: id,
        description: `Deleted supplier: ${supplier.name}`,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Workflow Stage 1: Raw Material Purchases
  app.get("/api/raw-material-purchases", async (req, res, next) => {
    try {
      const purchases = await storage.getRawMaterialPurchases();
      res.json(purchases);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/raw-material-purchases/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const purchase = await storage.getRawMaterialPurchase(id);
      
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      res.json(purchase);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/raw-material-purchases", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertRawMaterialPurchaseSchema.safeParse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid purchase data", errors: parseResult.error.errors });
      }
      
      const purchase = await storage.createRawMaterialPurchase(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "purchase",
        entityType: "raw_material",
        entityId: purchase.id,
        description: `Purchased ${purchase.quantity} ${purchase.unit} of ${purchase.materialName}`,
        quantity: purchase.quantity,
        amount: purchase.totalPrice,
        performedBy: req.user!.id,
        transactionDate: purchase.purchaseDate,
      });
      
      res.status(201).json(purchase);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/raw-material-purchases/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertRawMaterialPurchaseSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid purchase data", errors: parseResult.error.errors });
      }
      
      const updatedPurchase = await storage.updateRawMaterialPurchase(id, parseResult.data);
      
      if (!updatedPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "raw_material",
        entityId: updatedPurchase.id,
        description: `Updated purchase of ${updatedPurchase.materialName}`,
        quantity: updatedPurchase.quantity,
        amount: updatedPurchase.totalPrice,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedPurchase);
    } catch (error) {
      next(error);
    }
  });
  
  // Workflow Stage 2: Kacha Processing
  app.get("/api/kacha-processing", async (req, res, next) => {
    try {
      const processes = await storage.getKachaProcessings();
      res.json(processes);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/kacha-processing/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const process = await storage.getKachaProcessing(id);
      
      if (!process) {
        return res.status(404).json({ message: "Kacha processing not found" });
      }
      
      res.json(process);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/kacha-processing", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertKachaProcessingSchema.safeParse({
        ...req.body,
        processorId: req.user!.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid kacha processing data", errors: parseResult.error.errors });
      }
      
      const process = await storage.createKachaProcessing(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "process",
        entityType: "kacha_processing",
        entityId: process.id,
        description: `Processed ${process.inputQuantity} to ${process.outputQuantity} in kacha processing`,
        quantity: process.outputQuantity,
        performedBy: req.user!.id,
        transactionDate: process.processDate,
      });
      
      res.status(201).json(process);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/kacha-processing/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertKachaProcessingSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid kacha processing data", errors: parseResult.error.errors });
      }
      
      const updatedProcess = await storage.updateKachaProcessing(id, parseResult.data);
      
      if (!updatedProcess) {
        return res.status(404).json({ message: "Kacha processing not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "kacha_processing",
        entityId: updatedProcess.id,
        description: `Updated kacha processing with output quantity ${updatedProcess.outputQuantity}`,
        quantity: updatedProcess.outputQuantity,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedProcess);
    } catch (error) {
      next(error);
    }
  });
  
  // Workflow Stage 3: Draw Process
  app.get("/api/draw-process", async (req, res, next) => {
    try {
      const processes = await storage.getDrawProcesses();
      res.json(processes);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/draw-process/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const process = await storage.getDrawProcess(id);
      
      if (!process) {
        return res.status(404).json({ message: "Draw process not found" });
      }
      
      res.json(process);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/draw-process", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertDrawProcessSchema.safeParse({
        ...req.body,
        drawOperatorId: req.user!.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid draw process data", errors: parseResult.error.errors });
      }
      
      const process = await storage.createDrawProcess(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "process",
        entityType: "draw_process",
        entityId: process.id,
        description: `Processed ${process.inputQuantity} to ${process.outputQuantity} in draw process for ${process.wireSize} wire`,
        quantity: process.outputQuantity,
        performedBy: req.user!.id,
        transactionDate: process.processDate,
      });
      
      res.status(201).json(process);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/draw-process/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertDrawProcessSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid draw process data", errors: parseResult.error.errors });
      }
      
      const updatedProcess = await storage.updateDrawProcess(id, parseResult.data);
      
      if (!updatedProcess) {
        return res.status(404).json({ message: "Draw process not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "draw_process",
        entityId: updatedProcess.id,
        description: `Updated draw process with output quantity ${updatedProcess.outputQuantity}`,
        quantity: updatedProcess.outputQuantity,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedProcess);
    } catch (error) {
      next(error);
    }
  });
  
  // Workflow Stage 4: Ready Copper
  app.get("/api/ready-copper", async (req, res, next) => {
    try {
      const readyCoppers = await storage.getReadyCoppers();
      res.json(readyCoppers);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/ready-copper/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const readyCopper = await storage.getReadyCopper(id);
      
      if (!readyCopper) {
        return res.status(404).json({ message: "Ready copper not found" });
      }
      
      res.json(readyCopper);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/ready-copper", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertReadyCopperSchema.safeParse({
        ...req.body,
        verifiedBy: req.user!.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid ready copper data", errors: parseResult.error.errors });
      }
      
      const readyCopper = await storage.createReadyCopper(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "verify",
        entityType: "ready_copper",
        entityId: readyCopper.id,
        description: `Verified ${readyCopper.quantity} ${readyCopper.unit} of ${readyCopper.wireSize} ready copper`,
        quantity: readyCopper.quantity,
        performedBy: req.user!.id,
        transactionDate: readyCopper.verificationDate,
      });
      
      res.status(201).json(readyCopper);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/ready-copper/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertReadyCopperSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid ready copper data", errors: parseResult.error.errors });
      }
      
      const updatedReadyCopper = await storage.updateReadyCopper(id, parseResult.data);
      
      if (!updatedReadyCopper) {
        return res.status(404).json({ message: "Ready copper not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "ready_copper",
        entityId: updatedReadyCopper.id,
        description: `Updated ${updatedReadyCopper.wireSize} ready copper`,
        quantity: updatedReadyCopper.quantity,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedReadyCopper);
    } catch (error) {
      next(error);
    }
  });
  
  // Workflow Stage 5: PVC Purchase
  app.get("/api/pvc-purchases", async (req, res, next) => {
    try {
      const purchases = await storage.getPvcPurchases();
      res.json(purchases);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/pvc-purchases/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const purchase = await storage.getPvcPurchase(id);
      
      if (!purchase) {
        return res.status(404).json({ message: "PVC purchase not found" });
      }
      
      res.json(purchase);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/pvc-purchases", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const parseResult = insertPvcPurchaseSchema.safeParse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid PVC purchase data", errors: parseResult.error.errors });
      }
      
      const purchase = await storage.createPvcPurchase(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "purchase",
        entityType: "pvc_material",
        entityId: purchase.id,
        description: `Purchased ${purchase.quantity} ${purchase.unit} of ${purchase.color || ''} ${purchase.materialType}`,
        quantity: purchase.quantity,
        amount: purchase.totalPrice,
        performedBy: req.user!.id,
        transactionDate: purchase.purchaseDate,
      });
      
      res.status(201).json(purchase);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/pvc-purchases/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const parseResult = insertPvcPurchaseSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid PVC purchase data", errors: parseResult.error.errors });
      }
      
      const updatedPurchase = await storage.updatePvcPurchase(id, parseResult.data);
      
      if (!updatedPurchase) {
        return res.status(404).json({ message: "PVC purchase not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "pvc_material",
        entityId: updatedPurchase.id,
        description: `Updated purchase of ${updatedPurchase.materialType}`,
        quantity: updatedPurchase.quantity,
        amount: updatedPurchase.totalPrice,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedPurchase);
    } catch (error) {
      next(error);
    }
  });
  
  // Workflow Stage 6: Production
  app.get("/api/production", async (req, res, next) => {
    try {
      const productions = await storage.getProductions();
      res.json(productions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/production/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const production = await storage.getProduction(id);
      
      if (!production) {
        return res.status(404).json({ message: "Production not found" });
      }
      
      res.json(production);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/production", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Calculate profit if not provided
      let productionData = { ...req.body, createdBy: req.user!.id };
      if (productionData.sellingPrice && productionData.productionCost && !productionData.profit) {
        productionData.profit = Number(productionData.sellingPrice) - Number(productionData.productionCost);
      }
      
      const parseResult = insertProductionSchema.safeParse(productionData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid production data", errors: parseResult.error.errors });
      }
      
      const production = await storage.createProduction(parseResult.data);
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "production",
        entityType: "production",
        entityId: production.id,
        description: `Produced ${production.quantity} ${production.unit} of ${production.wireSize} ${production.productName}`,
        quantity: production.quantity,
        amount: production.sellingPrice,
        performedBy: req.user!.id,
        transactionDate: production.productionDate,
      });
      
      res.status(201).json(production);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/production/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Recalculate profit if needed
      let productionData = { ...req.body };
      if (productionData.sellingPrice && productionData.productionCost) {
        productionData.profit = Number(productionData.sellingPrice) - Number(productionData.productionCost);
      }
      
      const parseResult = insertProductionSchema.partial().safeParse(productionData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid production data", errors: parseResult.error.errors });
      }
      
      const updatedProduction = await storage.updateProduction(id, parseResult.data);
      
      if (!updatedProduction) {
        return res.status(404).json({ message: "Production not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        transactionType: "update",
        entityType: "production",
        entityId: updatedProduction.id,
        description: `Updated production of ${updatedProduction.productName}`,
        quantity: updatedProduction.quantity,
        amount: updatedProduction.sellingPrice,
        performedBy: req.user!.id,
        transactionDate: new Date(),
      });
      
      res.json(updatedProduction);
    } catch (error) {
      next(error);
    }
  });
  
  // Transaction History
  app.get("/api/transactions", async (req, res, next) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/transactions/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  });
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get raw material total
      const rawMaterials = await storage.getRawMaterialPurchases();
      const totalRawMaterials = rawMaterials.reduce((sum, purchase) => sum + Number(purchase.quantity), 0);
      
      // Get finished products total
      const productions = await storage.getProductions();
      const totalProducts = productions.reduce((sum, prod) => sum + Number(prod.quantity), 0);
      
      // Get suppliers count
      const suppliers = await storage.getSuppliers();
      const suppliersCount = suppliers.length;
      
      // Get inventory value
      const rawMaterialValue = rawMaterials.reduce((sum, purchase) => sum + Number(purchase.totalPrice), 0);
      const pvcPurchases = await storage.getPvcPurchases();
      const pvcValue = pvcPurchases.reduce((sum, purchase) => sum + Number(purchase.totalPrice), 0);
      const productionValue = productions.reduce((sum, prod) => sum + Number(prod.sellingPrice), 0);
      const totalValue = rawMaterialValue + pvcValue + productionValue;
      
      res.json({
        rawMaterials: totalRawMaterials,
        finishedProducts: totalProducts,
        suppliers: suppliersCount,
        totalValue
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/dashboard/recent-activities", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const transactions = await storage.getTransactions();
      // Sort by date (most recent first) and take the latest 5
      const recentActivities = transactions
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5);
      
      res.json(recentActivities);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/dashboard/stock-levels", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Raw material stock level (consider this as total purchases minus amount used in kacha processing)
      const rawMaterials = await storage.getRawMaterialPurchases();
      const totalRawMaterials = rawMaterials.reduce((sum, purchase) => sum + Number(purchase.quantity), 0);
      
      const kachaProcessings = await storage.getKachaProcessings();
      const usedInKacha = kachaProcessings.reduce((sum, process) => sum + Number(process.inputQuantity), 0);
      
      const rawCopperPercentage = Math.round((1 - usedInKacha / totalRawMaterials) * 100);
      
      // PVC material stock level
      const pvcPurchases = await storage.getPvcPurchases();
      const totalPvc = pvcPurchases.reduce((sum, purchase) => sum + Number(purchase.quantity), 0);
      
      const productions = await storage.getProductions();
      // Assuming each production uses some PVC - this is simplified
      const pvcUsed = productions.reduce((sum, prod) => sum + Number(prod.quantity) * 0.1, 0); // 0.1 is a made-up factor
      
      const pvcPercentage = Math.round((1 - pvcUsed / totalPvc) * 100);
      
      // Packaging (let's assume this is 80% for demo)
      const packagingPercentage = 80;
      
      res.json({
        rawCopper: {
          name: "Raw Copper",
          percentage: rawCopperPercentage
        },
        pvcMaterial: {
          name: "PVC Material",
          percentage: pvcPercentage
        },
        packaging: {
          name: "Packaging",
          percentage: packagingPercentage
        }
      });
    } catch (error) {
      next(error);
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
