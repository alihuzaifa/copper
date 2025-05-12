import { users, type User, type InsertUser, suppliers, type Supplier, type InsertSupplier, supplierCategories, type SupplierCategory, type InsertSupplierCategory, drawerCategories, type DrawerCategory, type InsertDrawerCategory, kachaUserCategories, type KachaUserCategory, type InsertKachaUserCategory, rawMaterialPurchases, type RawMaterialPurchase, type InsertRawMaterialPurchase, kachaProcessing, type KachaProcessing, type InsertKachaProcessing, drawProcess, type DrawProcess, type InsertDrawProcess, readyCopper, type ReadyCopper, type InsertReadyCopper, pvcPurchases, type PvcPurchase, type InsertPvcPurchase, production, type Production, type InsertProduction, transactions, type Transaction, type InsertTransaction, otps, type Otp, type InsertOtp } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined>;
  
  // Supplier Categories
  getSupplierCategories(): Promise<SupplierCategory[]>;
  getSupplierCategory(id: number): Promise<SupplierCategory | undefined>;
  createSupplierCategory(category: InsertSupplierCategory): Promise<SupplierCategory>;
  updateSupplierCategory(id: number, category: Partial<InsertSupplierCategory>): Promise<SupplierCategory | undefined>;
  deleteSupplierCategory(id: number): Promise<boolean>;
  
  // Drawer Categories
  getDrawerCategories(): Promise<DrawerCategory[]>;
  getDrawerCategory(id: number): Promise<DrawerCategory | undefined>;
  createDrawerCategory(category: InsertDrawerCategory): Promise<DrawerCategory>;
  updateDrawerCategory(id: number, category: Partial<InsertDrawerCategory>): Promise<DrawerCategory | undefined>;
  deleteDrawerCategory(id: number): Promise<boolean>;
  
  // Kacha User Categories
  getKachaUserCategories(): Promise<KachaUserCategory[]>;
  getKachaUserCategory(id: number): Promise<KachaUserCategory | undefined>;
  createKachaUserCategory(category: InsertKachaUserCategory): Promise<KachaUserCategory>;
  updateKachaUserCategory(id: number, category: Partial<InsertKachaUserCategory>): Promise<KachaUserCategory | undefined>;
  deleteKachaUserCategory(id: number): Promise<boolean>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliersByCategory(categoryId: number): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Raw Material Purchases
  getRawMaterialPurchases(): Promise<RawMaterialPurchase[]>;
  getRawMaterialPurchase(id: number): Promise<RawMaterialPurchase | undefined>;
  createRawMaterialPurchase(purchase: InsertRawMaterialPurchase): Promise<RawMaterialPurchase>;
  updateRawMaterialPurchase(id: number, purchase: Partial<InsertRawMaterialPurchase>): Promise<RawMaterialPurchase | undefined>;
  
  // Kacha Processing
  getKachaProcessings(): Promise<KachaProcessing[]>;
  getKachaProcessing(id: number): Promise<KachaProcessing | undefined>;
  createKachaProcessing(processing: InsertKachaProcessing): Promise<KachaProcessing>;
  updateKachaProcessing(id: number, processing: Partial<InsertKachaProcessing>): Promise<KachaProcessing | undefined>;
  
  // Draw Process
  getDrawProcesses(): Promise<DrawProcess[]>;
  getDrawProcess(id: number): Promise<DrawProcess | undefined>;
  createDrawProcess(process: InsertDrawProcess): Promise<DrawProcess>;
  updateDrawProcess(id: number, process: Partial<InsertDrawProcess>): Promise<DrawProcess | undefined>;
  
  // Ready Copper
  getReadyCoppers(): Promise<ReadyCopper[]>;
  getReadyCopper(id: number): Promise<ReadyCopper | undefined>;
  createReadyCopper(readyCopper: InsertReadyCopper): Promise<ReadyCopper>;
  updateReadyCopper(id: number, readyCopper: Partial<InsertReadyCopper>): Promise<ReadyCopper | undefined>;
  
  // PVC Purchases
  getPvcPurchases(): Promise<PvcPurchase[]>;
  getPvcPurchase(id: number): Promise<PvcPurchase | undefined>;
  createPvcPurchase(purchase: InsertPvcPurchase): Promise<PvcPurchase>;
  updatePvcPurchase(id: number, purchase: Partial<InsertPvcPurchase>): Promise<PvcPurchase | undefined>;
  
  // Production
  getProductions(): Promise<Production[]>;
  getProduction(id: number): Promise<Production | undefined>;
  createProduction(prod: InsertProduction): Promise<Production>;
  updateProduction(id: number, prod: Partial<InsertProduction>): Promise<Production | undefined>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // OTP
  createOtp(otp: InsertOtp): Promise<Otp>;
  getOtp(userId: number, otpCode: string): Promise<Otp | undefined>;
  markOtpAsUsed(id: number): Promise<Otp | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private supplierCategoriesMap: Map<number, SupplierCategory>;
  private drawerCategoriesMap: Map<number, DrawerCategory>;
  private kachaUserCategoriesMap: Map<number, KachaUserCategory>;
  private suppliersMap: Map<number, Supplier>;
  private rawMaterialPurchasesMap: Map<number, RawMaterialPurchase>;
  private kachaProcessingMap: Map<number, KachaProcessing>;
  private drawProcessMap: Map<number, DrawProcess>;
  private readyCopperMap: Map<number, ReadyCopper>;
  private pvcPurchasesMap: Map<number, PvcPurchase>;
  private productionMap: Map<number, Production>;
  private transactionsMap: Map<number, Transaction>;
  private otpsMap: Map<number, Otp>;
  
  private userIdCounter: number;
  private supplierCategoryIdCounter: number;
  private drawerCategoryIdCounter: number;
  private kachaUserCategoryIdCounter: number;
  private supplierIdCounter: number;
  private rawMaterialPurchaseIdCounter: number;
  private kachaProcessingIdCounter: number;
  private drawProcessIdCounter: number;
  private readyCopperIdCounter: number;
  private pvcPurchaseIdCounter: number;
  private productionIdCounter: number;
  private transactionIdCounter: number;
  private otpIdCounter: number;
  
  sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.supplierCategoriesMap = new Map();
    this.drawerCategoriesMap = new Map();
    this.kachaUserCategoriesMap = new Map();
    this.suppliersMap = new Map();
    this.rawMaterialPurchasesMap = new Map();
    this.kachaProcessingMap = new Map();
    this.drawProcessMap = new Map();
    this.readyCopperMap = new Map();
    this.pvcPurchasesMap = new Map();
    this.productionMap = new Map();
    this.transactionsMap = new Map();
    this.otpsMap = new Map();
    
    this.userIdCounter = 1;
    this.supplierCategoryIdCounter = 1;
    this.drawerCategoryIdCounter = 1;
    this.kachaUserCategoryIdCounter = 1;
    this.supplierIdCounter = 1;
    this.rawMaterialPurchaseIdCounter = 1;
    this.kachaProcessingIdCounter = 1;
    this.drawProcessIdCounter = 1;
    this.readyCopperIdCounter = 1;
    this.pvcPurchaseIdCounter = 1;
    this.productionIdCounter = 1;
    this.transactionIdCounter = 1;
    this.otpIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add default admin user
    this.createUser({
      username: 'admin',
      password: 'admin_password', // This will be hashed in auth.ts
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      phone: '1234567890'
    });
    
    // Add sample categories
    this.seedCategories();
  }
  
  private seedCategories() {
    // Supplier categories
    this.createSupplierCategory({ name: 'Raw Material Supplier', description: 'Supplies raw copper materials' });
    this.createSupplierCategory({ name: 'PVC Supplier', description: 'Supplies PVC materials' });
    this.createSupplierCategory({ name: 'Equipment Supplier', description: 'Supplies manufacturing equipment' });
    
    // Drawer categories
    this.createDrawerCategory({ name: 'Thin Wire', description: 'For thin copper wires' });
    this.createDrawerCategory({ name: 'Medium Wire', description: 'For medium copper wires' });
    this.createDrawerCategory({ name: 'Thick Wire', description: 'For thick copper wires' });
    
    // Kacha user categories
    this.createKachaUserCategory({ name: 'Primary Processor', description: 'Handles primary copper processing' });
    this.createKachaUserCategory({ name: 'Secondary Processor', description: 'Handles secondary copper processing' });
    this.createKachaUserCategory({ name: 'Quality Control', description: 'Handles quality inspection of processed copper' });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      createdAt: now
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, isVerified };
      this.usersMap.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }
  
  // Supplier Categories
  async getSupplierCategories(): Promise<SupplierCategory[]> {
    return Array.from(this.supplierCategoriesMap.values());
  }
  
  async getSupplierCategory(id: number): Promise<SupplierCategory | undefined> {
    return this.supplierCategoriesMap.get(id);
  }
  
  async createSupplierCategory(category: InsertSupplierCategory): Promise<SupplierCategory> {
    const id = this.supplierCategoryIdCounter++;
    const now = new Date();
    const newCategory: SupplierCategory = { ...category, id, createdAt: now };
    this.supplierCategoriesMap.set(id, newCategory);
    return newCategory;
  }
  
  async updateSupplierCategory(id: number, category: Partial<InsertSupplierCategory>): Promise<SupplierCategory | undefined> {
    const existingCategory = await this.getSupplierCategory(id);
    if (existingCategory) {
      const updatedCategory = { ...existingCategory, ...category };
      this.supplierCategoriesMap.set(id, updatedCategory);
      return updatedCategory;
    }
    return undefined;
  }
  
  async deleteSupplierCategory(id: number): Promise<boolean> {
    return this.supplierCategoriesMap.delete(id);
  }
  
  // Drawer Categories
  async getDrawerCategories(): Promise<DrawerCategory[]> {
    return Array.from(this.drawerCategoriesMap.values());
  }
  
  async getDrawerCategory(id: number): Promise<DrawerCategory | undefined> {
    return this.drawerCategoriesMap.get(id);
  }
  
  async createDrawerCategory(category: InsertDrawerCategory): Promise<DrawerCategory> {
    const id = this.drawerCategoryIdCounter++;
    const now = new Date();
    const newCategory: DrawerCategory = { ...category, id, createdAt: now };
    this.drawerCategoriesMap.set(id, newCategory);
    return newCategory;
  }
  
  async updateDrawerCategory(id: number, category: Partial<InsertDrawerCategory>): Promise<DrawerCategory | undefined> {
    const existingCategory = await this.getDrawerCategory(id);
    if (existingCategory) {
      const updatedCategory = { ...existingCategory, ...category };
      this.drawerCategoriesMap.set(id, updatedCategory);
      return updatedCategory;
    }
    return undefined;
  }
  
  async deleteDrawerCategory(id: number): Promise<boolean> {
    return this.drawerCategoriesMap.delete(id);
  }
  
  // Kacha User Categories
  async getKachaUserCategories(): Promise<KachaUserCategory[]> {
    return Array.from(this.kachaUserCategoriesMap.values());
  }
  
  async getKachaUserCategory(id: number): Promise<KachaUserCategory | undefined> {
    return this.kachaUserCategoriesMap.get(id);
  }
  
  async createKachaUserCategory(category: InsertKachaUserCategory): Promise<KachaUserCategory> {
    const id = this.kachaUserCategoryIdCounter++;
    const now = new Date();
    const newCategory: KachaUserCategory = { ...category, id, createdAt: now };
    this.kachaUserCategoriesMap.set(id, newCategory);
    return newCategory;
  }
  
  async updateKachaUserCategory(id: number, category: Partial<InsertKachaUserCategory>): Promise<KachaUserCategory | undefined> {
    const existingCategory = await this.getKachaUserCategory(id);
    if (existingCategory) {
      const updatedCategory = { ...existingCategory, ...category };
      this.kachaUserCategoriesMap.set(id, updatedCategory);
      return updatedCategory;
    }
    return undefined;
  }
  
  async deleteKachaUserCategory(id: number): Promise<boolean> {
    return this.kachaUserCategoriesMap.delete(id);
  }
  
  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliersMap.values());
  }
  
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliersMap.get(id);
  }
  
  async getSuppliersByCategory(categoryId: number): Promise<Supplier[]> {
    return Array.from(this.suppliersMap.values()).filter(
      (supplier) => supplier.categoryId === categoryId
    );
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierIdCounter++;
    const now = new Date();
    const newSupplier: Supplier = { ...supplier, id, createdAt: now };
    this.suppliersMap.set(id, newSupplier);
    return newSupplier;
  }
  
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existingSupplier = await this.getSupplier(id);
    if (existingSupplier) {
      const updatedSupplier = { ...existingSupplier, ...supplier };
      this.suppliersMap.set(id, updatedSupplier);
      return updatedSupplier;
    }
    return undefined;
  }
  
  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliersMap.delete(id);
  }
  
  // Raw Material Purchases
  async getRawMaterialPurchases(): Promise<RawMaterialPurchase[]> {
    return Array.from(this.rawMaterialPurchasesMap.values());
  }
  
  async getRawMaterialPurchase(id: number): Promise<RawMaterialPurchase | undefined> {
    return this.rawMaterialPurchasesMap.get(id);
  }
  
  async createRawMaterialPurchase(purchase: InsertRawMaterialPurchase): Promise<RawMaterialPurchase> {
    const id = this.rawMaterialPurchaseIdCounter++;
    const now = new Date();
    const newPurchase: RawMaterialPurchase = { ...purchase, id, createdAt: now };
    this.rawMaterialPurchasesMap.set(id, newPurchase);
    return newPurchase;
  }
  
  async updateRawMaterialPurchase(id: number, purchase: Partial<InsertRawMaterialPurchase>): Promise<RawMaterialPurchase | undefined> {
    const existingPurchase = await this.getRawMaterialPurchase(id);
    if (existingPurchase) {
      const updatedPurchase = { ...existingPurchase, ...purchase };
      this.rawMaterialPurchasesMap.set(id, updatedPurchase);
      return updatedPurchase;
    }
    return undefined;
  }
  
  // Kacha Processing
  async getKachaProcessings(): Promise<KachaProcessing[]> {
    return Array.from(this.kachaProcessingMap.values());
  }
  
  async getKachaProcessing(id: number): Promise<KachaProcessing | undefined> {
    return this.kachaProcessingMap.get(id);
  }
  
  async createKachaProcessing(processing: InsertKachaProcessing): Promise<KachaProcessing> {
    const id = this.kachaProcessingIdCounter++;
    const now = new Date();
    const newProcessing: KachaProcessing = { ...processing, id, createdAt: now };
    this.kachaProcessingMap.set(id, newProcessing);
    return newProcessing;
  }
  
  async updateKachaProcessing(id: number, processing: Partial<InsertKachaProcessing>): Promise<KachaProcessing | undefined> {
    const existingProcessing = await this.getKachaProcessing(id);
    if (existingProcessing) {
      const updatedProcessing = { ...existingProcessing, ...processing };
      this.kachaProcessingMap.set(id, updatedProcessing);
      return updatedProcessing;
    }
    return undefined;
  }
  
  // Draw Process
  async getDrawProcesses(): Promise<DrawProcess[]> {
    return Array.from(this.drawProcessMap.values());
  }
  
  async getDrawProcess(id: number): Promise<DrawProcess | undefined> {
    return this.drawProcessMap.get(id);
  }
  
  async createDrawProcess(process: InsertDrawProcess): Promise<DrawProcess> {
    const id = this.drawProcessIdCounter++;
    const now = new Date();
    const newProcess: DrawProcess = { ...process, id, createdAt: now };
    this.drawProcessMap.set(id, newProcess);
    return newProcess;
  }
  
  async updateDrawProcess(id: number, process: Partial<InsertDrawProcess>): Promise<DrawProcess | undefined> {
    const existingProcess = await this.getDrawProcess(id);
    if (existingProcess) {
      const updatedProcess = { ...existingProcess, ...process };
      this.drawProcessMap.set(id, updatedProcess);
      return updatedProcess;
    }
    return undefined;
  }
  
  // Ready Copper
  async getReadyCoppers(): Promise<ReadyCopper[]> {
    return Array.from(this.readyCopperMap.values());
  }
  
  async getReadyCopper(id: number): Promise<ReadyCopper | undefined> {
    return this.readyCopperMap.get(id);
  }
  
  async createReadyCopper(readyCopper: InsertReadyCopper): Promise<ReadyCopper> {
    const id = this.readyCopperIdCounter++;
    const now = new Date();
    const newReadyCopper: ReadyCopper = { ...readyCopper, id, createdAt: now };
    this.readyCopperMap.set(id, newReadyCopper);
    return newReadyCopper;
  }
  
  async updateReadyCopper(id: number, readyCopper: Partial<InsertReadyCopper>): Promise<ReadyCopper | undefined> {
    const existingReadyCopper = await this.getReadyCopper(id);
    if (existingReadyCopper) {
      const updatedReadyCopper = { ...existingReadyCopper, ...readyCopper };
      this.readyCopperMap.set(id, updatedReadyCopper);
      return updatedReadyCopper;
    }
    return undefined;
  }
  
  // PVC Purchases
  async getPvcPurchases(): Promise<PvcPurchase[]> {
    return Array.from(this.pvcPurchasesMap.values());
  }
  
  async getPvcPurchase(id: number): Promise<PvcPurchase | undefined> {
    return this.pvcPurchasesMap.get(id);
  }
  
  async createPvcPurchase(purchase: InsertPvcPurchase): Promise<PvcPurchase> {
    const id = this.pvcPurchaseIdCounter++;
    const now = new Date();
    const newPurchase: PvcPurchase = { ...purchase, id, createdAt: now };
    this.pvcPurchasesMap.set(id, newPurchase);
    return newPurchase;
  }
  
  async updatePvcPurchase(id: number, purchase: Partial<InsertPvcPurchase>): Promise<PvcPurchase | undefined> {
    const existingPurchase = await this.getPvcPurchase(id);
    if (existingPurchase) {
      const updatedPurchase = { ...existingPurchase, ...purchase };
      this.pvcPurchasesMap.set(id, updatedPurchase);
      return updatedPurchase;
    }
    return undefined;
  }
  
  // Production
  async getProductions(): Promise<Production[]> {
    return Array.from(this.productionMap.values());
  }
  
  async getProduction(id: number): Promise<Production | undefined> {
    return this.productionMap.get(id);
  }
  
  async createProduction(prod: InsertProduction): Promise<Production> {
    const id = this.productionIdCounter++;
    const now = new Date();
    const newProduction: Production = { ...prod, id, createdAt: now };
    this.productionMap.set(id, newProduction);
    return newProduction;
  }
  
  async updateProduction(id: number, prod: Partial<InsertProduction>): Promise<Production | undefined> {
    const existingProduction = await this.getProduction(id);
    if (existingProduction) {
      const updatedProduction = { ...existingProduction, ...prod };
      this.productionMap.set(id, updatedProduction);
      return updatedProduction;
    }
    return undefined;
  }
  
  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsMap.get(id);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const newTransaction: Transaction = { ...transaction, id, createdAt: now };
    this.transactionsMap.set(id, newTransaction);
    return newTransaction;
  }
  
  // OTP
  async createOtp(otp: InsertOtp): Promise<Otp> {
    const id = this.otpIdCounter++;
    const now = new Date();
    const newOtp: Otp = { ...otp, id, isUsed: false, createdAt: now };
    this.otpsMap.set(id, newOtp);
    return newOtp;
  }
  
  async getOtp(userId: number, otpCode: string): Promise<Otp | undefined> {
    return Array.from(this.otpsMap.values()).find(
      (otp) => otp.userId === userId && otp.otp === otpCode && !otp.isUsed && new Date() < new Date(otp.expiresAt)
    );
  }
  
  async markOtpAsUsed(id: number): Promise<Otp | undefined> {
    const otp = this.otpsMap.get(id);
    if (otp) {
      const updatedOtp = { ...otp, isUsed: true };
      this.otpsMap.set(id, updatedOtp);
      return updatedOtp;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
