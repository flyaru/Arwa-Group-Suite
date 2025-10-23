
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginPage from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/Settings';
import DSRsPage from './pages/DSRs';
import CustomersPage from './pages/Customers';
import InvoicesPage from './pages/Invoices';
import SupplierBillsPage from './pages/SupplierBills';
import UnauthorizedPage from './pages/Unauthorized';
import Authorization from './components/auth/Authorization';
import { NAV_LINKS } from './constants';
import type { User } from './types';
import HRPage from './pages/HR';
import ReportsPage from './pages/Reports';
import AdminPage from './pages/Admin';
import CampaignsPage from './pages/Campaigns';
import CashPage from './pages/Cash';
import SuppliersPage from './pages/Suppliers';
import TravelersPage from './pages/Travelers';
import ReconciliationPage from './pages/Reconciliation';
import AuditLogPage from './pages/AuditLog';
import UserTransitionAnimation from './components/common/UserTransitionAnimation';

// Helper function to find roles for a path
// FIX: Changed return type from string[] to User['role'][] to match prop type in Authorization component.
const getRolesForPath = (path: string): User['role'][] => {
    const link = NAV_LINKS.find(l => l.path === path);
    return link ? link.roles : [];
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const AppLayout: React.FC = () => (
    <ProtectedRoute>
        <MainLayout>
            <Outlet />
        </MainLayout>
    </ProtectedRoute>
);

const AppRoutes: React.FC = () => {
    const { animationState } = useApp();
    return (
        <>
            {animationState.show && (animationState.type === 'login' || animationState.type === 'logout') && (
                <div className="fixed inset-0 z-[100] pointer-events-none">
                     <UserTransitionAnimation type={animationState.type} userName={animationState.userName || ''} />
                </div>
            )}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Authorization allowedRoles={getRolesForPath('/dashboard')}><Dashboard /></Authorization>} />
                    <Route path="/dsrs" element={<Authorization allowedRoles={getRolesForPath('/dsrs')}><DSRsPage /></Authorization>} />
                    <Route path="/customers" element={<Authorization allowedRoles={getRolesForPath('/customers')}><CustomersPage /></Authorization>} />
                    <Route path="/travelers" element={<Authorization allowedRoles={getRolesForPath('/travelers')}><TravelersPage /></Authorization>} />
                    <Route path="/suppliers" element={<Authorization allowedRoles={getRolesForPath('/suppliers')}><SuppliersPage /></Authorization>} />
                    <Route path="/supplier-bills" element={<Authorization allowedRoles={getRolesForPath('/supplier-bills')}><SupplierBillsPage /></Authorization>} />
                    <Route path="/invoices" element={<Authorization allowedRoles={getRolesForPath('/invoices')}><InvoicesPage /></Authorization>} />
                    <Route path="/reconciliation" element={<Authorization allowedRoles={getRolesForPath('/reconciliation')}><ReconciliationPage /></Authorization>} />
                    <Route path="/cash" element={<Authorization allowedRoles={getRolesForPath('/cash')}><CashPage /></Authorization>} />
                    <Route path="/hr" element={<Authorization allowedRoles={getRolesForPath('/hr')}><HRPage /></Authorization>} />
                    <Route path="/campaigns" element={<Authorization allowedRoles={getRolesForPath('/campaigns')}><CampaignsPage /></Authorization>} />
                    <Route path="/reports" element={<Authorization allowedRoles={getRolesForPath('/reports')}><ReportsPage /></Authorization>} />
                    <Route path="/settings" element={<Authorization allowedRoles={getRolesForPath('/settings')}><SettingsPage /></Authorization>} />
                    <Route path="/admin" element={<Authorization allowedRoles={getRolesForPath('/admin')}><AdminPage /></Authorization>} />
                    <Route path="/audit-log" element={<Authorization allowedRoles={getRolesForPath('/audit-log')}><AuditLogPage /></Authorization>} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                </Route>
            </Routes>
        </>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AuthProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </AuthProvider>
        </AppProvider>
    );
};

export default App;
