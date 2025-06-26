// ============================================
// MÓDULO CRM AVANZADO
// ============================================

export interface Lead {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number; // 0-100
  assignedTo: string;
  estimatedValue: number;
  expectedCloseDate?: Date;
  notes?: string;
  tags: string[];
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  companyId: string;
  leadId?: string;
  customerId?: string;
  title: string;
  description: string;
  value: number;
  probability: number; // 0-100
  stage: OpportunityStage;
  assignedTo: string;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  lostReason?: string;
  products: OpportunityProduct[];
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OpportunityProduct {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  dueDate?: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'cancelled';
  assignedTo: string;
  relatedTo: {
    type: 'lead' | 'customer' | 'opportunity';
    id: string;
  };
  createdAt: Date;
}

export interface Campaign {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: number;
  actualCost: number;
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  leads: string[];
  metrics: CampaignMetrics;
  createdAt: Date;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  roi: number;
}

export type LeadSource = 'website' | 'social_media' | 'referral' | 'cold_call' | 'email' | 'event' | 'advertisement' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';
export type CampaignType = 'email' | 'social_media' | 'advertisement' | 'event' | 'direct_mail';
export type CampaignStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';