import React, { useEffect, useState } from 'react';
import { Clock, FileText, Calendar, User, Download, CheckCircle, X, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { usePortalStore } from '../../store/portalStore';
import type { EmployeeLeave } from '../../types/portal';

const ClockInOutCard: React.FC = () => {
  const { clockIn, clockOut, employeeAttendance } = usePortalStore();
  const [location, setLocation] = useState('');
  
  const today = new Date().toDateString();
  const todayAttendance = employeeAttendance.find(record => 
    record.date.toDateString() === today
  );
  
  const isClockedIn = todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut;
  
  const handleClockIn = async () => {
    try {
      await clockIn(location || 'Oficina Principal');
    } catch (error) {
      console.error('Error clocking in:', error);
    }
  };
  
  const handleClockOut = async () => {
    try {
      await clockOut();
    } catch (error) {
      console.error('Error clocking out:', error);
    }
  };

  return (
    <Card className={`${isClockedIn ? 'border-success-200 bg-success-50 dark:bg-success-900/20' : 'border-primary-200 bg-primary-50 dark:bg-primary-900/20'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isClockedIn 
                ? 'bg-success-100 dark:bg-success-900/30' 
                : 'bg-primary-100 dark:bg-primary-900/30'
            }`}>
              <Clock className={`w-6 h-6 ${
                isClockedIn 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-primary-600 dark:text-primary-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Control de Asistencia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isClockedIn ? 'Sesión activa' : 'Marcar entrada'}
              </p>
            </div>
          </div>
          
          {isClockedIn && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Activo
            </Badge>
          )}
        </div>

        {todayAttendance && (
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Entrada:</span>
                <p className="font-medium">
                  {todayAttendance.clockIn ? todayAttendance.clockIn.toLocaleTimeString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Salida:</span>
                <p className="font-medium">
                  {todayAttendance.clockOut ? todayAttendance.clockOut.toLocaleTimeString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Horas:</span>
                <p className="font-medium">{todayAttendance.totalHours.toFixed(1)}h</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Ubicación:</span>
                <p className="font-medium">{todayAttendance.location || 'No especificada'}</p>
              </div>
            </div>
          </div>
        )}

        {!isClockedIn && !todayAttendance && (
          <div className="mb-4">
            <Input
              label="Ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Oficina Principal"
              icon={MapPin}
            />
          </div>
        )}

        <div className="flex gap-3">
          {!isClockedIn ? (
            <Button onClick={handleClockIn} icon={CheckCircle} fullWidth>
              Marcar Entrada
            </Button>
          ) : (
            <Button onClick={handleClockOut} variant="error" icon={X} fullWidth>
              Marcar Salida
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const LeaveRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { createLeaveRequest, isLoading } = usePortalStore();
  const [formData, setFormData] = useState({
    type: 'vacation' as const,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createLeaveRequest({
        ...formData,
        days: calculateDays()
      });
      onClose();
      setFormData({
        type: 'vacation',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
    } catch (error) {
      console.error('Error creating leave request:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Permiso" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading} fullWidth>
            Enviar Solicitud
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    employeeAttendance,
    employeePayslips,
    employeeLeaves,
    employeeDocuments,
    fetchEmployeeAttendance,
    fetchEmployeePayslips,
    fetchEmployeeLeaves,
    fetchEmployeeDocuments,
    isLoading
  } = usePortalStore();

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    fetchEmployeeAttendance();
    fetchEmployeePayslips();
    fetchEmployeeLeaves();
    fetchEmployeeDocuments();
  }, [fetchEmployeeAttendance, fetchEmployeePayslips, fetchEmployeeLeaves, fetchEmployeeDocuments]);

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

  const thisMonthAttendance = employeeAttendance.filter(record => {
    const recordMonth = record.date.getMonth();
    const currentMonth = new Date().getMonth();
    return recordMonth === currentMonth;
  });

  const totalHoursThisMonth = thisMonthAttendance.reduce((sum, record) => sum + record.totalHours, 0);
  const averageHoursPerDay = thisMonthAttendance.length > 0 ? totalHoursThisMonth / thisMonthAttendance.length : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Hola, {currentUser?.firstName}!
        </h1>
        <p className="opacity-90 mb-4">
          Bienvenido a tu portal de colaborador. Aquí puedes gestionar tu asistencia, ver tus recibos de nómina y solicitar permisos.
        </p>
        {currentUser?.employeeData && (
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm opacity-90">Cargo</p>
              <p className="font-semibold">{currentUser.employeeData.position}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm opacity-90">Departamento</p>
              <p className="font-semibold">{currentUser.employeeData.department}</p>
            </div>
          </div>
        )}
      </div>

      {/* Clock In/Out Card */}
      <ClockInOutCard />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Horas del Mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalHoursThisMonth.toFixed(1)}h
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio Diario</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {averageHoursPerDay.toFixed(1)}h
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permisos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {employeeLeaves.filter(leave => leave.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {employeeDocuments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payslips */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recibos de Nómina
            </h3>
          </div>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Salario Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Horas Extra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Neto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employeePayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payslip.period}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {payslip.issueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        ${payslip.baseSalary.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        ${payslip.overtime.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${payslip.netPay.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Download}
                        onClick={() => {
                          if (payslip.downloadUrl) {
                            window.open(payslip.downloadUrl, '_blank');
                          }
                        }}
                      >
                        Descargar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {employeePayslips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay recibos disponibles
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Los recibos de nómina aparecerán aquí cuando estén disponibles
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Solicitudes de Permiso
            </h3>
            <Button onClick={() => setShowLeaveModal(true)} icon={Calendar} size="sm">
              Nueva Solicitud
            </Button>
          </div>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Solicitado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employeeLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white capitalize">
                        {leave.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {leave.startDate.toLocaleDateString()} - {leave.endDate.toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">{leave.days}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLeaveStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        {leave.createdAt.toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {employeeLeaves.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tienes solicitudes de permiso
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Puedes solicitar vacaciones, permisos médicos y otros tipos de ausencias
              </p>
              <Button onClick={() => setShowLeaveModal(true)} icon={Calendar}>
                Solicitar Permiso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
      />
    </div>
  );
};