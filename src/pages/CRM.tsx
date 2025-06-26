import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, Target, TrendingUp, Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useCRMStore } from '../store/crmStore';
import type { Lead, Opportunity } from '../types/crm';

const LeadForm: React.FC<{
  lead?: Lead;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ lead, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: lead?.firstName || '',
    lastName: lead?.lastName || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    position: lead?.position || '',
    source: lead?.source || 'website',
    status: lead?.status || 'new',
    estimatedValue: lead?.estimatedValue || 0,
    notes: lead?.notes || '',
    tags: lead?.tags?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      score: 50, // Default score
      assignedTo: '1' // Current user
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <Input
          label="Apellido"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Teléfono"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Empresa"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        <Input
          label="Cargo"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fuente
          </label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="website">Sitio Web</option>
            <option value="social_media">Redes Sociales</option>
            <option value="referral">Referencia</option>
            <option value="cold_call">Llamada en Frío</option>
            <option value="email">Email</option>
            <option value="event">Evento</option>
            <option value="advertisement">Publicidad</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="qualified">Calificado</option>
            <option value="proposal">Propuesta</option>
            <option value="negotiation">Negociación</option>
            <option value="won">Ganado</option>
            <option value="lost">Perdido</option>
          </select>
        </div>

        <Input
          label="Valor Estimado"
          type="number"
          step="0.01"
          value={formData.estimatedValue}
          onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <Input
        label="Etiquetas"
        value={formData.tags}
        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        placeholder="Separadas por comas"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {lead ? 'Actualizar Lead' : 'Crear Lead'}
        </Button>
      </div>
    </form>
  );
};

export const CRM: React.FC = () => {
  const {
    leads,
    opportunities,
    isLoading,
    fetchLeads,
    createLead,
    updateLead,
    fetchOpportunities,
    getLeadsBySource,
    getConversionRate,
    getSalesFunnel
  } = useCRMStore();

  const [activeTab, setActiveTab] = useState<'leads' | 'opportunities'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchOpportunities();
  }, [fetchLeads, fetchOpportunities]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leadsBySource = getLeadsBySource();
  const conversionRate = getConversionRate();
  const salesFunnel = getSalesFunnel();

  const handleCreateLead = async (data: any) => {
    try {
      await createLead(data);
      setShowLeadModal(false);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdateLead = async (data: any) => {
    if (editingLead) {
      try {
        await updateLead(editingLead.id, data);
        setEditingLead(null);
        setShowLeadModal(false);
      } catch (error) {
        console.error('Error updating lead:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'default',
      contacted: 'primary',
      qualified: 'warning',
      proposal: 'warning',
      negotiation: 'warning',
      won: 'success',
      lost: 'error'
    } as const;
    
    const labels = {
      new: 'Nuevo',
      contacted: 'Contactado',
      qualified: 'Calificado',
      proposal: 'Propuesta',
      negotiation: 'Negociación',
      won: 'Ganado',
      lost: 'Perdido'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="success" size="sm">Caliente</Badge>;
    if (score >= 60) return <Badge variant="warning" size="sm">Tibio</Badge>;
    return <Badge variant="default" size="sm">Frío</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {leads.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Oportunidades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {opportunities.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Pipeline</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'leads'
              ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'opportunities'
              ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Oportunidades
        </button>
      </div>

      {activeTab === 'leads' && (
        <>
          {/* Filtros y acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="qualified">Calificado</option>
                <option value="proposal">Propuesta</option>
                <option value="negotiation">Negociación</option>
                <option value="won">Ganado</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
            
            <Button onClick={() => setShowLeadModal(true)} icon={Plus}>
              Nuevo Lead
            </Button>
          </div>

          {/* Lista de leads */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Leads ({filteredLeads.length})
              </h3>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fuente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Valor Estimado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
                                {lead.firstName[0]}{lead.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-gray-900 dark:text-white">{lead.company || '-'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.position || '-'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-white capitalize">
                            {lead.source.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${lead.estimatedValue.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white">{lead.score}</span>
                            {getScoreBadge(lead.score)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Phone}
                              onClick={() => window.open(`tel:${lead.phone}`)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Mail}
                              onClick={() => window.open(`mailto:${lead.email}`)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingLead(lead);
                                setShowLeadModal(true);
                              }}
                            >
                              Editar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredLeads.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay leads
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm ? 'No se encontraron leads con ese término' : 'Comienza agregando tu primer lead'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowLeadModal(true)} icon={Plus}>
                      Crear Lead
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'opportunities' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pipeline de Ventas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {salesFunnel.map((stage) => (
                <div key={stage.stage} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                    {stage.stage.replace('_', ' ')}
                  </h4>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {stage.count}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${stage.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear/editar lead */}
      <Modal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setEditingLead(null);
        }}
        title={editingLead ? 'Editar Lead' : 'Nuevo Lead'}
        size="lg"
      >
        <LeadForm
          lead={editingLead || undefined}
          onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
          onCancel={() => {
            setShowLeadModal(false);
            setEditingLead(null);
          }}
        />
      </Modal>
    </div>
  );
};