// ============================================
// MÓDULO DE PRODUCCIÓN
// ============================================

export interface ProductionOrder {
  id: string;
  companyId: string;
  orderNumber: string;
  productId: string;
  quantity: number;
  status: ProductionStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedTo: string[];
  workStations: string[];
  materials: ProductionMaterial[];
  operations: ProductionOperation[];
  qualityChecks: QualityCheck[];
  costs: ProductionCost;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionMaterial {
  materialId: string;
  requiredQuantity: number;
  consumedQuantity: number;
  unitCost: number;
  totalCost: number;
  status: 'pending' | 'allocated' | 'consumed';
}

export interface ProductionOperation {
  id: string;
  name: string;
  description: string;
  workStationId: string;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  assignedTo?: string;
  status: OperationStatus;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface QualityCheck {
  id: string;
  checkpointName: string;
  inspector: string;
  checkDate: Date;
  status: 'passed' | 'failed' | 'pending';
  defects: QualityDefect[];
  notes?: string;
}

export interface QualityDefect {
  type: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  quantity: number;
  action: 'rework' | 'scrap' | 'accept';
}

export interface ProductionCost {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerUnit: number;
}

export interface WorkStation {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: 'manual' | 'semi_automatic' | 'automatic';
  capacity: number; // units per hour
  location: string;
  isActive: boolean;
  maintenanceSchedule: MaintenanceSchedule[];
  createdAt: Date;
}

export interface MaintenanceSchedule {
  id: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  technician?: string;
  cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface BillOfMaterials {
  id: string;
  companyId: string;
  productId: string;
  version: string;
  isActive: boolean;
  materials: BOMItem[];
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMItem {
  materialId: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isOptional: boolean;
  notes?: string;
}

export interface ProductionReport {
  id: string;
  companyId: string;
  period: string;
  totalOrders: number;
  completedOrders: number;
  totalProduced: number;
  totalCost: number;
  efficiency: number; // percentage
  qualityRate: number; // percentage
  onTimeDelivery: number; // percentage
  metrics: ProductionMetrics;
  createdAt: Date;
}

export interface ProductionMetrics {
  averageLeadTime: number; // days
  averageSetupTime: number; // minutes
  machineUtilization: number; // percentage
  laborUtilization: number; // percentage
  scrapRate: number; // percentage
  reworkRate: number; // percentage
}

export type ProductionStatus = 'planned' | 'released' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type OperationStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';