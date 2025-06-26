import { create } from 'zustand';
import type { ProductionOrder, WorkStation, BillOfMaterials, ProductionReport } from '../types/production';

interface ProductionState {
  productionOrders: ProductionOrder[];
  workStations: WorkStation[];
  billsOfMaterials: BillOfMaterials[];
  reports: ProductionReport[];
  isLoading: boolean;
  
  // Production Orders
  fetchProductionOrders: () => Promise<void>;
  createProductionOrder: (orderData: {
    productId: string;
    quantity: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    plannedStartDate: Date;
    plannedEndDate: Date;
    assignedTo: string[];
    workStations: string[];
    notes?: string;
  }) => Promise<void>;
  updateProductionOrder: (id: string, updates: Partial<ProductionOrder>) => Promise<void>;
  startProduction: (id: string) => Promise<void>;
  completeProduction: (id: string) => Promise<void>;
  
  // Work Stations
  fetchWorkStations: () => Promise<void>;
  createWorkStation: (stationData: Omit<WorkStation, 'id' | 'createdAt'>) => Promise<void>;
  
  // Bill of Materials
  fetchBillsOfMaterials: () => Promise<void>;
  createBOM: (bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Analytics
  getProductionEfficiency: () => number;
  getWorkStationUtilization: () => Array<{ stationId: string; utilization: number }>;
  getQualityMetrics: () => { passRate: number; defectRate: number; reworkRate: number };
}

// Mock data
const mockWorkStations: WorkStation[] = [
  {
    id: '1',
    companyId: 'company-1',
    name: 'Estación de Ensamble A',
    description: 'Estación principal de ensamble de productos',
    type: 'manual',
    capacity: 10,
    location: 'Planta Principal - Área A',
    isActive: true,
    maintenanceSchedule: [],
    createdAt: new Date(),
  },
];

const mockProductionOrders: ProductionOrder[] = [
  {
    id: '1',
    companyId: 'company-1',
    orderNumber: 'PROD-2024-001',
    productId: '1',
    quantity: 100,
    status: 'in_progress',
    priority: 'high',
    plannedStartDate: new Date(),
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    actualStartDate: new Date(),
    assignedTo: ['1'],
    workStations: ['1'],
    materials: [
      {
        materialId: '2',
        requiredQuantity: 200,
        consumedQuantity: 150,
        unitCost: 50,
        totalCost: 10000,
        status: 'allocated'
      }
    ],
    operations: [
      {
        id: '1',
        name: 'Preparación de materiales',
        description: 'Preparar todos los materiales necesarios',
        workStationId: '1',
        estimatedDuration: 120,
        actualDuration: 110,
        assignedTo: '1',
        status: 'completed',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 10 * 60 * 1000),
      }
    ],
    qualityChecks: [],
    costs: {
      materialCost: 10000,
      laborCost: 5000,
      overheadCost: 2000,
      totalCost: 17000,
      costPerUnit: 170
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useProductionStore = create<ProductionState>((set, get) => ({
  productionOrders: [],
  workStations: [],
  billsOfMaterials: [],
  reports: [],
  isLoading: false,

  fetchProductionOrders: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ productionOrders: mockProductionOrders, isLoading: false });
  },

  createProductionOrder: async (orderData) => {
    set({ isLoading: true });
    
    const newOrder: ProductionOrder = {
      id: Date.now().toString(),
      companyId: 'company-1',
      orderNumber: `PROD-${new Date().getFullYear()}-${String(get().productionOrders.length + 1).padStart(3, '0')}`,
      ...orderData,
      status: 'planned',
      materials: [],
      operations: [],
      qualityChecks: [],
      costs: {
        materialCost: 0,
        laborCost: 0,
        overheadCost: 0,
        totalCost: 0,
        costPerUnit: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      productionOrders: [newOrder, ...state.productionOrders],
      isLoading: false
    }));
  },

  updateProductionOrder: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      productionOrders: state.productionOrders.map(order =>
        order.id === id ? { ...order, ...updates, updatedAt: new Date() } : order
      ),
      isLoading: false
    }));
  },

  startProduction: async (id) => {
    await get().updateProductionOrder(id, {
      status: 'in_progress',
      actualStartDate: new Date()
    });
  },

  completeProduction: async (id) => {
    await get().updateProductionOrder(id, {
      status: 'completed',
      actualEndDate: new Date()
    });
  },

  fetchWorkStations: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ workStations: mockWorkStations });
  },

  createWorkStation: async (stationData) => {
    const newStation: WorkStation = {
      ...stationData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set(state => ({
      workStations: [...state.workStations, newStation]
    }));
  },

  fetchBillsOfMaterials: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ billsOfMaterials: [] });
  },

  createBOM: async (bomData) => {
    const newBOM: BillOfMaterials = {
      ...bomData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      billsOfMaterials: [...state.billsOfMaterials, newBOM]
    }));
  },

  getProductionEfficiency: () => {
    const { productionOrders } = get();
    const completedOrders = productionOrders.filter(order => order.status === 'completed');
    const onTimeOrders = completedOrders.filter(order => 
      order.actualEndDate && order.actualEndDate <= order.plannedEndDate
    );
    
    return completedOrders.length > 0 ? (onTimeOrders.length / completedOrders.length) * 100 : 0;
  },

  getWorkStationUtilization: () => {
    const { workStations } = get();
    
    return workStations.map(station => ({
      stationId: station.id,
      utilization: Math.random() * 100 // Mock calculation
    }));
  },

  getQualityMetrics: () => {
    return {
      passRate: 95.5,
      defectRate: 3.2,
      reworkRate: 1.3
    };
  },
}));