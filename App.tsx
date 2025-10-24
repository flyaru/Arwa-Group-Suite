

import React, { useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import TasksPage from './pages/Tasks';

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
    const { animationState, isLoading, setIsSearchModalOpen } = useApp();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setIsSearchModalOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [setIsSearchModalOpen]);


    return (
        <>
            <GlobalSearchModal />
            {isLoading && (
                 <div className="fixed inset-0 bg-[#0B2D48]/80 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                        <p className="text-white text-lg font-medium">Loading Live Data...</p>
                    </div>
                </div>
            )}
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
                    {/* FIX: Corrected typo in function name from getRolesforPath to getRolesForPath. */}
                    <Route path="/suppliers" element={<Authorization allowedRoles={getRolesForPath('/suppliers')}><SuppliersPage /></Authorization>} />
                    <Route path="/supplier-bills" element={<Authorization allowedRoles={getRolesForPath('/supplier-bills')}><SupplierBillsPage /></Authorization>} />
                    <Route path="/invoices" element={<Authorization allowedRoles={getRolesForPath('/invoices')}><InvoicesPage /></Authorization>} />
                    <Route path="/reconciliation" element={<Authorization allowedRoles={getRolesForPath('/reconciliation')}><ReconciliationPage /></Authorization>} />
                    <Route path="/cash" element={<Authorization allowedRoles={getRolesForPath('/cash')}><CashPage /></Authorization>} />
                    <Route path="/hr" element={<Authorization allowedRoles={getRolesForPath('/hr')}><HRPage /></Authorization>} />
                    <Route path="/tasks" element={<Authorization allowedRoles={getRolesForPath('/tasks')}><TasksPage /></Authorization>} />
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
        // FIX: Correctly wrapped child components with AppProvider and AuthProvider to resolve the
        // "Property 'children' is missing" error. These context providers must contain the components
        // that consume their context.
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