import React, { useEffect } from 'react';
import { PortalLogin } from '../components/portal/PortalLogin';
import { PortalLayout } from '../components/portal/PortalLayout';
import { CustomerDashboard } from '../components/portal/CustomerDashboard';
import { EmployeeDashboard } from '../components/portal/EmployeeDashboard';
import { usePortalStore } from '../store/portalStore';

export const Portal: React.FC = () => {
  const { currentUser, isAuthenticated, fetchNotifications } = usePortalStore();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchNotifications();
    }
  }, [isAuthenticated, currentUser, fetchNotifications]);

  if (!isAuthenticated || !currentUser) {
    return <PortalLogin />;
  }

  return (
    <PortalLayout>
      {currentUser.type === 'customer' ? (
        <CustomerDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </PortalLayout>
  );
};