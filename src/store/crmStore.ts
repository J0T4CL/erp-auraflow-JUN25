import { create } from 'zustand';
import type { Lead, Opportunity, Activity, Campaign } from '../types/crm';

interface CRMState {
  leads: Lead[];
  opportunities: Opportunity[];
  activities: Activity[];
  campaigns: Campaign[];
  isLoading: boolean;
  
  // Leads
  fetchLeads: () => Promise<void>;
  createLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  convertLeadToCustomer: (id: string) => Promise<void>;
  
  // Opportunities
  fetchOpportunities: () => Promise<void>;
  createOpportunity: (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => Promise<void>;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => Promise<void>;
  
  // Activities
  createActivity: (activityData: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
  
  // Analytics
  getLeadsBySource: () => Record<string, number>;
  getConversionRate: () => number;
  getSalesFunnel: () => Array<{ stage: string; count: number; value: number }>;
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    companyId: 'company-1',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@empresa.com',
    phone: '+52 55 1234 5678',
    company: 'Empresa ABC',
    position: 'Gerente de Compras',
    source: 'website',
    status: 'qualified',
    score: 75,
    assignedTo: '1',
    estimatedValue: 50000,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: 'Interesada en solución completa de inventario',
    tags: ['hot-lead', 'enterprise'],
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    companyId: 'company-1',
    leadId: '1',
    title: 'Implementación ERP Empresa ABC',
    description: 'Proyecto de implementación completa del sistema ERP',
    value: 150000,
    probability: 70,
    stage: 'proposal',
    assignedTo: '1',
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    products: [
      {
        productId: '1',
        quantity: 1,
        unitPrice: 150000,
        discount: 0,
        total: 150000
      }
    ],
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useCRMStore = create<CRMState>((set, get) => ({
  leads: [],
  opportunities: [],
  activities: [],
  campaigns: [],
  isLoading: false,

  fetchLeads: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ leads: mockLeads, isLoading: false });
  },

  createLead: async (leadData) => {
    set({ isLoading: true });
    
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      leads: [newLead, ...state.leads],
      isLoading: false
    }));
  },

  updateLead: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      leads: state.leads.map(lead =>
        lead.id === id ? { ...lead, ...updates, updatedAt: new Date() } : lead
      ),
      isLoading: false
    }));
  },

  convertLeadToCustomer: async (id) => {
    // This would create a customer record and update the lead status
    await get().updateLead(id, { status: 'won' });
  },

  fetchOpportunities: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ opportunities: mockOpportunities, isLoading: false });
  },

  createOpportunity: async (opportunityData) => {
    set({ isLoading: true });
    
    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: Date.now().toString(),
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set(state => ({
      opportunities: [newOpportunity, ...state.opportunities],
      isLoading: false
    }));
  },

  updateOpportunity: async (id, updates) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      opportunities: state.opportunities.map(opp =>
        opp.id === id ? { ...opp, ...updates, updatedAt: new Date() } : opp
      ),
      isLoading: false
    }));
  },

  createActivity: async (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set(state => ({
      activities: [newActivity, ...state.activities]
    }));
  },

  completeActivity: async (id) => {
    set(state => ({
      activities: state.activities.map(activity =>
        activity.id === id 
          ? { ...activity, status: 'completed', completedDate: new Date() }
          : activity
      )
    }));
  },

  getLeadsBySource: () => {
    const { leads } = get();
    const sourceCount: Record<string, number> = {};
    
    leads.forEach(lead => {
      sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
    });
    
    return sourceCount;
  },

  getConversionRate: () => {
    const { leads } = get();
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'won').length;
    
    return totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  },

  getSalesFunnel: () => {
    const { opportunities } = get();
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation'];
    
    return stages.map(stage => {
      const stageOpps = opportunities.filter(opp => opp.stage === stage);
      return {
        stage,
        count: stageOpps.length,
        value: stageOpps.reduce((sum, opp) => sum + opp.value, 0)
      };
    });
  },
}));