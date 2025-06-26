import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Clock, Calendar, DollarSign, TrendingUp, CheckCircle, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useHRStore } from '../store/hrStore';
import type { Employee, LeaveRequest } from '../types/hr';

const EmployeeForm: React.FC<{
  employee?: Employee;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ employee, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    position: employee?.position || '',
    department: employee?.department || '',
    salary: employee?.salary || 0,
    salaryType: employee?.salaryType || 'monthly',
    hireDate: employee?.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    address: {
      street: employee?.address?.street || '',
      city: employee?.address?.city || '',
      state: employee?.address?.state || '',
      zipCode: employee?.address?.zipCode || '',
      country: employee?.address?.country || 'México'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      hireDate: new Date(formData.hireDate),
      dateOfBirth: new Date('1990-01-01'), // Mock
      workSchedule: {
        type: 'fixed',
        hoursPerWeek: 40,
        workDays: [
          { day: 'monday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          { day: 'tuesday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          { day: 'wednesday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          { day: 'thursday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          { day: 'friday', startTime: '09:00', endTime: '18:00', breakDuration: 60 },
        ]
      },
      bankAccount: {
        bankName: 'Banco Nacional',
        accountNumber: '1234567890',
        accountType: 'checking'
      },
      emergencyContact: {
        name: 'Contacto de Emergencia',
        relationship: 'Familiar',
        phone: '+52 55 0000 0000'
      },
      documents: [],
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          required
        />
        <Input
          label="Cargo"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          required
        />
        <Input
          label="Departamento"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Salario"
          type="number"
          step="0.01"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Salario
          </label>
          <select
            value={formData.salaryType}
            onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="hourly">Por Hora</option>
            <option value="monthly">Mensual</option>
            <option value="annual">Anual</option>
          </select>
        </div>
        <Input
          label="Fecha de Contratación"
          type="date"
          value={formData.hireDate}
          onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
          required
        />
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Dirección</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Calle"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
            />
          </div>
          <Input
            label="Ciudad"
            value={formData.address.city}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, city: e.target.value }
            })}
          />
          <Input
            label="Estado"
            value={formData.address.state}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, state: e.target.value }
            })}
          />
          <Input
            label="Código Postal"
            value={formData.address.zipCode}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, zipCode: e.target.value }
            })}
          />
          <Input
            label="País"
            value={formData.address.country}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, country: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {employee ? 'Actualizar Empleado' : 'Crear Empleado'}
        </Button>
      </div>
    </form>
  );
};

const LeaveRequestForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const { employees } = useHRStore();
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'vacation' as 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const calculateDays = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      days: calculateDays(),
      status: 'pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Empleado
        </label>
        <select
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        >
          <option value="">Seleccionar empleado</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Permiso
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="vacation">Vacaciones</option>
          <option value="sick">Enfermedad</option>
          <option value="personal">Personal</option>
          <option value="maternity">Maternidad</option>
          <option value="paternity">Paternidad</option>
          <option value="bereavement">Duelo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de Inicio"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
        />
        <Input
          label="Fecha de Fin"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          required
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Días solicitados: <strong>{calculateDays()}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Motivo
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Describe el motivo del permiso..."
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Solicitar Permiso
        </Button>
      </div>
    </form>
  );
};

export const HR: React.FC = () => {
  const {
    employees,
    leaveRequests,
    isLoading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    getAttendanceStats,
    clockIn,
    clockOut
  } = useHRStore();

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attendanceStats = getAttendanceStats();
  const pendingLeaves = leaveRequests.filter(request => request.status === 'pending');

  const handleCreateEmployee = async (data: any) => {
    try {
      await createEmployee(data);
      setShowEmployeeModal(false);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleUpdateEmployee = async (data: any) => {
    if (editingEmployee) {
      try {
        await updateEmployee(editingEmployee.id, data);
        setEditingEmployee(null);
        setShowEmployeeModal(false);
      } catch (error) {
        console.error('Error updating employee:', error);
      }
    }
  };

  const handleCreateLeaveRequest = async (data: any) => {
    try {
      await createLeaveRequest(data);
      setShowLeaveModal(false);
    } catch (error) {
      console.error('Error creating leave request:', error);
    }
  };

  const getLeaveStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default'
    } as const;
    
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'} size="sm">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendanceStats.totalEmployees}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presentes Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendanceStats.presentToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ausentes Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendanceStats.absentToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900/20 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permisos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingLeaves.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'employees', label: 'Empleados' },
          { id: 'attendance', label: 'Asistencia' },
          { id: 'leaves', label: 'Permisos' },
          { id: 'payroll', label: 'Nómina' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'employees' && (
        <>
          {/* Filtros y acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            
            <Button onClick={() => setShowEmployeeModal(true)} icon={Plus}>
              Nuevo Empleado
            </Button>
          </div>

          {/* Lista de empleados */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Empleados ({filteredEmployees.length})
              </h3>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Salario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha Contratación
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
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-white">{employee.position}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-white">{employee.department}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${employee.salary.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            /{employee.salaryType === 'monthly' ? 'mes' : employee.salaryType === 'annual' ? 'año' : 'hora'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 dark:text-white">
                            {new Date(employee.hireDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={employee.isActive ? 'success' : 'error'} size="sm">
                            {employee.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingEmployee(employee);
                                setShowEmployeeModal(true);
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
              
              {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay empleados
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm ? 'No se encontraron empleados con ese término' : 'Comienza agregando tu primer empleado'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowEmployeeModal(true)} icon={Plus}>
                      Crear Empleado
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'leaves' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Solicitudes de Permiso
            </h3>
            <Button onClick={() => setShowLeaveModal(true)} icon={Plus}>
              Nueva Solicitud
            </Button>
          </div>

          <Card>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Días
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
                    {leaveRequests.map((request) => {
                      const employee = employees.find(emp => emp.id === request.employeeId);
                      return (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Empleado no encontrado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-900 dark:text-white capitalize">
                              {request.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-gray-900 dark:text-white">
                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-900 dark:text-white">{request.days}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getLeaveStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {request.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => approveLeaveRequest(request.id)}
                                  className="text-success-600"
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => rejectLeaveRequest(request.id, 'Rechazado por administración')}
                                  className="text-error-600"
                                >
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {(activeTab === 'attendance' || activeTab === 'payroll') && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Módulo en Desarrollo
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Esta funcionalidad estará disponible próximamente
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear/editar empleado */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
        size="xl"
      >
        <EmployeeForm
          employee={editingEmployee || undefined}
          onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
          onCancel={() => {
            setShowEmployeeModal(false);
            setEditingEmployee(null);
          }}
        />
      </Modal>

      {/* Modal para solicitud de permiso */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Nueva Solicitud de Permiso"
        size="md"
      >
        <LeaveRequestForm
          onSubmit={handleCreateLeaveRequest}
          onCancel={() => setShowLeaveModal(false)}
        />
      </Modal>
    </div>
  );
};