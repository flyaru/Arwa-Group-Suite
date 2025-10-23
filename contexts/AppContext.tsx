import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { DSR, Invoice, SupplierBill, Airport, Route, Customer, LeaveRequest, CashHandover, Supplier, Traveler, User, AttendanceRecord, AuditLogEntry } from '../types';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';
type AnimationState = {
    show: boolean;
    type: 'login' | 'logout' | null;
    userName?: string;
};

export const DEFAULT_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxUFvM8wnSsif2DQfg0raordYGddoF-leXTb_6XhYlOxoG9tBfEnI-lMtObgZucZHBF6Q/exec';

// --- API Helper ---
async function apiCall(url: string, action: string, payload?: any) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        throw new Error(`API call failed for action: ${action}. Status: ${response.status}`);
    }

    const text = await response.text();
    try {
        const result = JSON.parse(text);
        if (result.status === 'error') {
            throw new Error(result.message || 'An unknown backend error occurred.');
        }
        return result.data;
    } catch (e) {
        console.error("Failed to parse API response:", text);
        throw new Error("Received an invalid response from the backend.");
    }
}


interface AppContextType {
    language: Language;
    direction: Direction;
    toggleLanguage: () => void;
    
    // Backend State
    appsScriptUrl: string | null;
    isBackendConnected: boolean;
    isInitialLoading: boolean;
    backendError: string | null;
    setAppsScriptUrl: (url: string) => Promise<boolean>;
    testBackendConnection: (url: string) => Promise<any>;


    dsrs: DSR[];
    addDsr: (dsr: DSR) => Promise<void>;
    updateDsr: (updatedDsr: DSR) => Promise<void>;
    bulkDeleteDsrs: (dsrIds: string[]) => Promise<void>;

    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => Promise<void>;
    updateInvoice: (updatedInvoice: Invoice) => Promise<void>;
    markInvoiceAsPaid: (invoiceId: string) => Promise<void>;
    bulkMarkInvoicesAsPaid: (invoiceIds: string[]) => Promise<void>;
    bulkDeleteInvoices: (invoiceIds: string[]) => Promise<void>;

    supplierBills: SupplierBill[];
    addSupplierBill: (bill: Omit<SupplierBill, 'id'>) => Promise<void>;
    updateSupplierBillStatus: (billId: string, status: SupplierBill['status']) => Promise<void>;
    bulkMarkSupplierBillsAsPaid: (billIds: string[]) => Promise<void>;
    bulkDeleteSupplierBills: (billIds: string[]) => Promise<void>;

    handleInvoiceViewedAndLockDsr: (invoiceId: string) => Promise<void>;

    airports: Airport[];
    activeRoutes: Route[];
    
    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id' | 'totalSpend'>) => Promise<Customer>;
    bulkDeleteCustomers: (customerIds: string[]) => Promise<void>;


    suppliers: Supplier[];
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;

    travelers: Traveler[];
    addTraveler: (traveler: Omit<Traveler, 'id'>) => Promise<void>;
    
    employees: User[];
    addEmployee: (employee: Omit<User, 'id'>) => Promise<void>;
    updateEmployee: (updatedEmployee: User) => Promise<void>;

    leaveRequests: LeaveRequest[];
    requestLeave: (request: Omit<LeaveRequest, 'id' | 'status'>) => Promise<void>;
    updateLeaveStatus: (requestId: string, status: LeaveRequest['status']) => Promise<void>;

    cashHandovers: CashHandover[];
    initiateHandover: (handover: Omit<CashHandover, 'id' | 'status' | 'dateInitiated'>) => Promise<void>;
    confirmHandover: (handoverId: string, managerId: string, managerName: string) => Promise<void>;
    
    animationState: AnimationState;
    triggerAnimation: (type: AnimationState['type'], userName?: string, callback?: () => void) => void;

    attendanceLog: AttendanceRecord[];
    currentUserAttendanceStatus: 'in' | 'out';
    clockIn: (userId: string, userName: string) => Promise<void>;
    clockOut: (userId: string) => Promise<void>;

    auditLog: AuditLogEntry[];
    logAction: (logData: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const parseRouteString = (routeStr: string): [string, string] | null => {
    const parts = routeStr.match(/[A-Z]{3}/g);
    if (parts && parts.length >= 2) {
        return [parts[0], parts[1]];
    }
    return null;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // Local UI State
    const [language, setLanguage] = useState<Language>('en');
    const [direction, setDirection] = useState<Direction>('ltr');
    const [animationState, setAnimationState] = useState<AnimationState>({ show: false, type: null, userName: '' });
    
    // Backend and Data State
    const [appsScriptUrl, _setAppsScriptUrl] = useState<string | null>(() => {
        // Start with null if no URL is stored, forcing configuration on first launch.
        return localStorage.getItem('appsScriptUrl');
    });
    const [isBackendConnected, setIsBackendConnected] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    // Data states, initialized empty
    const [dsrs, setDsrs] = useState<DSR[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([]);
    const [airports, setAirports] = useState<Airport[]>([]);
    const [activeRoutes, setActiveRoutes] = useState<Route[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [travelers, setTravelers] = useState<Traveler[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [cashHandovers, setCashHandovers] = useState<CashHandover[]>([]);
    const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
    const [currentUserAttendanceStatus, setCurrentUserAttendanceStatus] = useState<'in' | 'out'>('out');
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    

    const setAndStoreUrl = (url: string) => {
        localStorage.setItem('appsScriptUrl', url);
        _setAppsScriptUrl(url);
    };

    const testBackendConnection = async (url: string) => {
        return apiCall(url, 'testConnection');
    };

    const setAppsScriptUrl = async (url: string): Promise<boolean> => {
        try {
            await testBackendConnection(url);
            setAndStoreUrl(url);
            setIsBackendConnected(true);
            // Trigger full reload to re-initialize contexts with the new URL
            window.location.reload(); 
            return true;
        } catch (error) {
            console.error("Failed to connect to backend URL:", error);
            setIsBackendConnected(false);
            return false;
        }
    };
    
    const fetchAllInitialData = useCallback(async () => {
        if (!appsScriptUrl) {
            setIsInitialLoading(false);
            setBackendError('Backend URL is not configured.');
            return;
        }
        setIsInitialLoading(true);
        setBackendError(null);
        try {
            const data = await apiCall(appsScriptUrl, 'fetchAllData');
            setDsrs(data.dsrs || []);
            setInvoices(data.invoices || []);
            setSupplierBills(data.supplierBills || []);
            setCustomers(data.customers || []);
            setSuppliers(data.suppliers || []);
            setTravelers(data.travelers || []);
            setEmployees(data.users || []);
            setLeaveRequests(data.leaveRequests || []);
            setCashHandovers(data.cashHandovers || []);
            setAttendanceLog(data.attendanceLog || []);
            setAuditLog(data.auditLog || []);
            setIsBackendConnected(true);
        } catch (error: any) {
            console.error("Error fetching initial data:", error);
            setBackendError(`Failed to fetch data from backend. Please check the URL and sheet setup. Error: ${error.message}`);
            setIsBackendConnected(false);
        } finally {
            setIsInitialLoading(false);
        }
    }, [appsScriptUrl]);

    useEffect(() => {
        fetchAllInitialData();
    }, [fetchAllInitialData]);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
    }, [language, direction]);

    const toggleLanguage = () => {
        setLanguage(prev => {
            const newLang = prev === 'en' ? 'ar' : 'en';
            setDirection(newLang === 'ar' ? 'rtl' : 'ltr');
            return newLang;
        });
    };
    
    const logAction = async (logData: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
        if (!appsScriptUrl) return;
        const newLogEntry: AuditLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...logData,
        };
        setAuditLog(prev => [newLogEntry, ...prev]);
        await apiCall(appsScriptUrl, 'add', { entity: 'AuditLog', data: newLogEntry });
    };

    const triggerAnimation = (type: AnimationState['type'], userName?: string, callback?: () => void) => {
        setAnimationState({ show: true, type, userName });
        setTimeout(() => {
            if (callback) callback();
            setAnimationState({ show: false, type: null, userName: '' });
        }, 2500);
    };

    // --- GENERIC API FUNCTIONS ---
    const addEntity = async (entity: string, data: any, stateUpdater: React.Dispatch<React.SetStateAction<any[]>>) => {
        if (!appsScriptUrl) throw new Error("Backend not connected");
        const addedItem = await apiCall(appsScriptUrl, 'add', { entity, data });
        stateUpdater(prev => [addedItem, ...prev]);
        return addedItem;
    };
    
    const updateEntity = async (entity: string, id: string, data: any, stateUpdater: React.Dispatch<React.SetStateAction<any[]>>) => {
        if (!appsScriptUrl) throw new Error("Backend not connected");
        const updatedItem = await apiCall(appsScriptUrl, 'update', { entity, id, data });
        stateUpdater(prev => prev.map(item => item.id === id ? updatedItem : item));
    };

    const bulkDeleteEntity = async (entity: string, ids: string[], stateUpdater: React.Dispatch<React.SetStateAction<any[]>>) => {
        if (!appsScriptUrl) throw new Error("Backend not connected");
        await apiCall(appsScriptUrl, 'bulkDelete', { entity, ids });
        stateUpdater(prev => prev.filter(item => !ids.includes(item.id)));
    };


    // --- SPECIFIC IMPLEMENTATIONS ---
    const addDsr = async (dsr: DSR) => { await addEntity('DSRs', dsr, setDsrs); };
    const updateDsr = async (updatedDsr: DSR) => { await updateEntity('DSRs', updatedDsr.id, updatedDsr, setDsrs); };
    const bulkDeleteDsrs = async (dsrIds: string[]) => { await bulkDeleteEntity('DSRs', dsrIds, setDsrs); };

    const addInvoice = async (invoice: Invoice) => { await addEntity('Invoices', invoice, setInvoices); };
    const updateInvoice = async (updatedInvoice: Invoice) => { await updateEntity('Invoices', updatedInvoice.id, updatedInvoice, setInvoices); };
    const bulkDeleteInvoices = async (invoiceIds: string[]) => { await bulkDeleteEntity('Invoices', invoiceIds, setInvoices); };

    const addSupplierBill = async (bill: Omit<SupplierBill, 'id'>) => {
        const newBill = { id: `BILL-${Date.now()}`, ...bill };
        await addEntity('SupplierBills', newBill, setSupplierBills);
    };
    const updateSupplierBillStatus = async (billId: string, status: SupplierBill['status']) => { await updateEntity('SupplierBills', billId, { status }, setSupplierBills); };
    const bulkDeleteSupplierBills = async (billIds: string[]) => { await bulkDeleteEntity('SupplierBills', billIds, setSupplierBills); };
    
    const bulkMarkBills = async (entity: string, ids: string[], stateUpdater: React.Dispatch<React.SetStateAction<any[]>>) => {
        if (!appsScriptUrl) throw new Error("Backend not connected");
        const updates = ids.map(id => ({ id, data: { status: 'paid' }}));
        await apiCall(appsScriptUrl, 'bulkUpdate', { entity, updates });
        stateUpdater(prev => prev.map(item => ids.includes(item.id) ? { ...item, status: 'paid' } : item));
    };
    
    const bulkMarkSupplierBillsAsPaid = (billIds: string[]) => bulkMarkBills('SupplierBills', billIds, setSupplierBills);
    
    const bulkMarkInvoicesAsPaid = async (invoiceIds: string[]) => {
        if (!appsScriptUrl) throw new Error("Backend not connected");
        
        await bulkMarkBills('Invoices', invoiceIds, setInvoices);

        // This part is complex to do efficiently without many API calls.
        // For now, we refetch customers to update their total spend.
        // A more advanced backend would handle this calculation.
        const updatedCustomers = await apiCall(appsScriptUrl, 'getAll', { entity: 'Customers' });
        setCustomers(updatedCustomers);
    };

    const markInvoiceAsPaid = async (invoiceId: string) => {
        if (!appsScriptUrl) throw new Error("Backend not connected");
        
        const invoiceToUpdate = invoices.find(i => i.id === invoiceId);
        if (invoiceToUpdate) {
            await updateInvoice({ ...invoiceToUpdate, status: 'paid' });

            // Refetch customers to update their total spend.
            const updatedCustomers = await apiCall(appsScriptUrl, 'getAll', { entity: 'Customers' });
            setCustomers(updatedCustomers);
        }
    };


    const handleInvoiceViewedAndLockDsr = async (invoiceId: string) => {
        const targetInvoice = invoices.find(i => i.id === invoiceId);
        if (!targetInvoice || targetInvoice.firstViewedAt) return;

        await updateInvoice({ ...targetInvoice, firstViewedAt: new Date().toISOString() });
        
        const targetDsr = dsrs.find(d => d.id === targetInvoice.dsrId);
        if (targetDsr && targetDsr.status !== 'posted') {
            await updateDsr({ ...targetDsr, status: 'posted' });
        }
    };

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'totalSpend'>): Promise<Customer> => {
        const newCustomer: Customer = {
            id: `CUST-${Date.now()}`,
            totalSpend: 0,
            ...customerData,
        };
        return await addEntity('Customers', newCustomer, setCustomers) as Customer;
    };
    const bulkDeleteCustomers = async (customerIds: string[]) => { await bulkDeleteEntity('Customers', customerIds, setCustomers); };
    
    const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
        const newSupplier: Supplier = { id: `SUP-${Date.now()}`, ...supplier };
        await addEntity('Suppliers', newSupplier, setSuppliers);
    };
    
    const addTraveler = async (traveler: Omit<Traveler, 'id'>) => {
        const newTraveler: Traveler = { id: `TR-${Date.now()}`, ...traveler };
        await addEntity('Travelers', newTraveler, setTravelers);
    };
    
    const addEmployee = async (employeeData: Omit<User, 'id'>) => {
        const newEmployee: User = { id: `EMP-${Date.now()}`, ...employeeData };
        await addEntity('Users', newEmployee, setEmployees);
    };
    const updateEmployee = async (updatedEmployee: User) => { await updateEntity('Users', updatedEmployee.id, updatedEmployee, setEmployees); };

    const requestLeave = async (request: Omit<LeaveRequest, 'id' | 'status'>) => {
        const newRequest = { id: `LR-${Date.now()}`, status: 'pending' as 'pending', ...request };
        await addEntity('LeaveRequests', newRequest, setLeaveRequests);
    };
    const updateLeaveStatus = async (requestId: string, status: LeaveRequest['status']) => { await updateEntity('LeaveRequests', requestId, { status }, setLeaveRequests); };

    const clockIn = async (userId: string, userName: string) => {
        const newRecord = { id: `ATT-${Date.now()}`, employeeId: userId, employeeName: userName, clockInTime: new Date().toISOString(), clockOutTime: null };
        await addEntity('AttendanceLog', newRecord, setAttendanceLog);
        setCurrentUserAttendanceStatus('in');
    };

    const clockOut = async (userId: string) => {
        const lastRecord = attendanceLog.find(att => att.employeeId === userId && !att.clockOutTime);
        if (lastRecord) {
            await updateEntity('AttendanceLog', lastRecord.id, { clockOutTime: new Date().toISOString() }, setAttendanceLog);
        }
        setCurrentUserAttendanceStatus('out');
    };

    const initiateHandover = async (handover: Omit<CashHandover, 'id' | 'status' | 'dateInitiated'>) => {
        const newHandover = { id: `CH-${Date.now()}`, status: 'pending' as 'pending', dateInitiated: new Date().toISOString(), ...handover };
        await addEntity('CashHandovers', newHandover, setCashHandovers);
    };
    
    const confirmHandover = async (handoverId: string, managerId: string, managerName: string) => {
        const data = { status: 'confirmed' as 'confirmed', managerId, managerName, dateConfirmed: new Date().toISOString() };
        await updateEntity('CashHandovers', handoverId, data, setCashHandovers);
    };

    return (
        <AppContext.Provider value={{
            language,
            direction,
            toggleLanguage,
            appsScriptUrl,
            isBackendConnected,
            isInitialLoading,
            backendError,
            setAppsScriptUrl,
            testBackendConnection,
            dsrs,
            addDsr,
            updateDsr,
            bulkDeleteDsrs,
            invoices,
            addInvoice,
            updateInvoice,
            markInvoiceAsPaid,
            bulkMarkInvoicesAsPaid,
            bulkDeleteInvoices,
            supplierBills,
            addSupplierBill,
            updateSupplierBillStatus,
            bulkMarkSupplierBillsAsPaid,
            bulkDeleteSupplierBills,
            handleInvoiceViewedAndLockDsr,
            airports,
            activeRoutes,
            customers,
            addCustomer,
            bulkDeleteCustomers,
            suppliers,
            addSupplier,
            travelers,
            addTraveler,
            employees,
            addEmployee,
            updateEmployee,
            leaveRequests,
            requestLeave,
            updateLeaveStatus,
            cashHandovers,
            initiateHandover,
            confirmHandover,
            animationState,
            triggerAnimation,
            attendanceLog,
            currentUserAttendanceStatus,
            clockIn,
            clockOut,
            auditLog,
            logAction,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};