// Workflow Stages
export const WORKFLOW_STAGES = [
  {
    id: 1,
    name: "Purchase",
    description: "Raw material procurement",
    path: "/workflow/purchase-management",
    icon: "shopping-cart"
  },
  {
    id: 2,
    name: "Kacha",
    description: "Kacha copper processing",
    path: "/workflow/kacha-processing",
    icon: "tools"
  },
  {
    id: 3,
    name: "Draw",
    description: "Wire drawing process",
    path: "/workflow/draw-process",
    icon: "dragging"
  },
  {
    id: 4,
    name: "Ready",
    description: "Ready copper verification",
    path: "/workflow/ready-copper",
    icon: "check-double"
  },
  {
    id: 5,
    name: "PVC",
    description: "PVC material purchase",
    path: "/workflow/pvc-purchase",
    icon: "drop"
  },
  {
    id: 6,
    name: "Production",
    description: "Final production",
    path: "/workflow/production",
    icon: "building-3"
  }
];

// Status options for various workflows
export const STATUS_OPTIONS = {
  purchase: ["pending", "approved", "received", "rejected"],
  kachaProcessing: ["in_progress", "completed", "failed"],
  drawProcess: ["in_progress", "completed", "failed"],
  readyCopper: ["ready", "dispatched", "in_stock", "rejected"],
  pvcPurchase: ["pending", "approved", "received", "rejected"],
  production: ["in_production", "completed", "quality_check", "packaged", "dispatched"]
};

// Status colors
export const STATUS_COLORS = {
  // Purchase status colors
  pending: "yellow",
  approved: "blue",
  received: "green",
  rejected: "red",
  
  // Process status colors
  in_progress: "yellow",
  completed: "green",
  failed: "red",
  
  // Ready copper status colors
  ready: "blue",
  dispatched: "green",
  in_stock: "purple",
  
  // Production status colors
  in_production: "yellow",
  quality_check: "purple",
  packaged: "blue",
};

// Default items per page for tables
export const DEFAULT_PAGE_SIZE = 10;

// Unit options for various materials
export const UNIT_OPTIONS = ["kg", "g", "ton", "m", "cm", "mm", "piece", "roll", "spool"];

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/api/login",
    logout: "/api/logout",
    register: "/api/register",
    user: "/api/user",
    verifyOtp: "/api/verify-otp",
    resendOtp: "/api/resend-otp",
    resetPasswordRequest: "/api/reset-password-request",
    resetPassword: "/api/reset-password"
  },
  categories: {
    supplierCategories: "/api/supplier-categories",
    drawerCategories: "/api/drawer-categories",
    kachaUserCategories: "/api/kacha-user-categories"
  },
  suppliers: "/api/suppliers",
  workflow: {
    rawMaterialPurchases: "/api/raw-material-purchases",
    kachaProcessing: "/api/kacha-processing",
    drawProcess: "/api/draw-process",
    readyCopper: "/api/ready-copper",
    pvcPurchases: "/api/pvc-purchases",
    production: "/api/production"
  },
  transactions: "/api/transactions",
  dashboard: {
    stats: "/api/dashboard/stats",
    recentActivities: "/api/dashboard/recent-activities",
    stockLevels: "/api/dashboard/stock-levels"
  }
};
