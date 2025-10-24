// /contexts/AppContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { DSR, Invoice, SupplierBill, Airport, Route, Customer, LeaveRequest, CashHandover, Supplier, Traveler, User, AttendanceRecord, AuditLogEntry, InvoiceItem, DSRStatus, Task } from '../types';
import {
    mockUsers, mockCustomers, mockSuppliers, mockTravelers, mockDsrs, mockInvoices,
    mockSupplierBills, mockLeaveRequests, mockCashHandovers, mockAttendanceLog, mockAuditLog,
    mockAirports, mockActiveRoutes, mockTasks
} from '../data/mockData';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';
type AnimationState = {
    show: boolean;
    type: 'login' | 'logout' | null;
    userName?: string;
};
type GlobalDetailView = { type: 'dsr' | 'invoice', id: string } | null;

// >>> DEFAULT BACKEND URL <<<
const DEFAULT_BACKEND_URL = "/api/gas";
interface AppContextType {
    isLiveMode: boolean;
    backendUrl: string | null;
    isLoading: boolean;
    setBackendAndSwitchToLive: (url: string) => Promise<boolean>;
    switchToDemoMode: () => void;
    
    language: Language;
    direction: Direction;
    toggleLanguage: () => void;
    
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

    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
    updateTask: (updatedTask: Task) => Promise<void>;

    apiClient: <T>(action: string, payload?: any) => Promise<T>;
    
    isSearchModalOpen: boolean;
    setIsSearchModalOpen: Dispatch<SetStateAction<boolean>>;
    globalDetailView: GlobalDetailView;
    setGlobalDetailView: (view: GlobalDetailView) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Fixed: generic arrow function explicit form to avoid TSX parse ambiguity
const apiClient: <T>(url: string, action: string, payload?: any) => Promise<T> = async (url, action, payload) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script-friendly
        body: JSON.stringify({ action, payload }),
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.status === 'error') {
        throw new Error(result.message || 'An unknown API error occurred.');
    }
    return result.data;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // UI and Mode State
    const [language, setLanguage] = useState<Language>('en');
    const [direction, setDirection] = useState<Direction>('ltr');
    const [animationState, setAnimationState] = useState<AnimationState>({ show: false, type: null, userName: '' });

    // Use saved URL or fall back to DEFAULT_BACKEND_URL
    const savedUrl = localStorage.getItem('backendUrl_arwa') ?? DEFAULT_BACKEND_URL;
    const [isLiveMode, setIsLiveMode] = useState<boolean>(!!savedUrl);
    const [backendUrl, setBackendUrl] = useState<string | null>(savedUrl);
    const [isLoading, setIsLoading] = useState<boolean>(!!savedUrl);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [globalDetailView, setGlobalDetailView] = useState<GlobalDetailView>(null);
    
    // Data State
    const [dsrs, setDsrs] = useState<DSR[]>(mockDsrs);
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
    const [supplierBills, setSupplierBills] = useState<SupplierBill[]>(mockSupplierBills);
    const [airports, setAirports] = useState<Airport[]>(mockAirports);
    const [activeRoutes, setActiveRoutes] = useState<Route[]>(mockActiveRoutes);
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
    const [travelers, setTravelers] = useState<Traveler[]>(mockTravelers);
    const [employees, setEmployees] = useState<User[]>(mockUsers);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
    const [cashHandovers, setCashHandovers] = useState<CashHandover[]>(mockCashHandovers);
    const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>(mockAttendanceLog);
    const [currentUserAttendanceStatus, setCurrentUserAttendanceStatus] = useState<'in' | 'out'>('out');
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(mockAuditLog);
    const [tasks, setTasks] = useState<Task[]>(mockTasks);

    // Persist URL if user switches it at runtime
    useEffect(() => {
        if (backendUrl) localStorage.setItem('backendUrl_arwa', backendUrl);
    }, [backendUrl]);

    const api: <T>(action: string, payload?: any) => Promise<T> = (action, payload) => {
        if (!backendUrl) throw new Error("Backend URL not set.");
        return apiClient(backendUrl, action, payload);
    }

    const fetchAllData = async () => {
        if (!backendUrl) return;
        setIsLoading(true);
        try {
            const data = await api<any>('fetchAllData');
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
            setTasks(data.tasks || []);
        } catch (error) {
            console.error("Failed to fetch all data:", error);
            alert("Failed to connect to the backend. Switching back to Demo Mode.");
            switchToDemoMode();
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
    }, [language, direction]);
    
    useEffect(() => {
        if (isLiveMode && backendUrl) {
            fetchAllData();
        }
    }, [isLiveMode, backendUrl]);
    
    const setBackendAndSwitchToLive = async (url: string) => {
        setIsLoading(true);
        try {
            await apiClient(url, 'testConnection');
            localStorage.setItem('backendUrl_arwa', url);
            setBackendUrl(url);
            setIsLiveMode(true);
            window.location.reload();
            return true;
        } catch (error) {
            console.error("Backend connection test failed:", error);
            setIsLoading(false);
            return false;
        }
    };

    const switchToDemoMode = () => {
        localStorage.removeItem('backendUrl_arwa');
        setBackendUrl(null);
        setIsLiveMode(false);
        window.location.reload();
    };

    const toggleLanguage = () => {
        setLanguage(prev => {
            const newLang = prev === 'en' ? 'ar' : 'en';
            setDirection(newLang === 'ar' ? 'rtl' : 'ltr');
            return newLang;
        });
    };
    
    const logAction = async (logData: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
        const newLogEntry: AuditLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...logData,
        };
        if (isLiveMode) {
            await api('add', { entity: 'AuditLog', data: newLogEntry });
        }
        setAuditLog(prev => [newLogEntry, ...prev]);
    };

    const triggerAnimation = (type: AnimationState['type'], userName?: string, callback?: () => void) => {
        setAnimationState({ show: true, type, userName });
        setTimeout(() => {
            if (callback) callback();
            setAnimationState({ show: false, type: null, userName: '' });
        }, 2500);
    };
    
    const addDsr = async (dsr: DSR) => { 
        if (isLiveMode) await api('add', { entity: 'DSRs', data: dsr });
        setDsrs(prev => [dsr, ...prev]);
    };
    const updateDsr = async (updatedDsr: DSR) => {
        if (isLiveMode) await api('update', { entity: 'DSRs', id: updatedDsr.id, data: updatedDsr });
        setDsrs(prev => prev.map(d => d.id === updatedDsr.id ? updatedDsr : d));
    };
    const bulkDeleteDsrs = async (dsrIds: string[]) => {
        if (isLiveMode) await api('bulkDelete', { entity: 'DSRs', ids: dsrIds });
        setDsrs(prev => prev.filter(d => !dsrIds.includes(d.id)));
    };

    const addInvoice = async (invoice: Invoice) => {
        if (isLiveMode) await api('add', { entity: 'Invoices', data: invoice });
        setInvoices(prev => [invoice, ...prev]);
    };
    const updateInvoice = async (updatedInvoice: Invoice) => {
        if (isLiveMode) await api('update', { entity: 'Invoices', id: updatedInvoice.id, data: updatedInvoice });
        setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    };
    const bulkDeleteInvoices = async (invoiceIds: string[]) => {
        if (isLiveMode) await api('bulkDelete', { entity: 'Invoices', ids: invoiceIds });
        setInvoices(prev => prev.filter(i => !invoiceIds.includes(i.id)));
    };

    const addSupplierBill = async (bill: Omit<SupplierBill, 'id'>) => {
        const newBill: SupplierBill = { id: `BILL-${Date.now()}`, ...bill };
        if (isLiveMode) await api('add', { entity: 'SupplierBills', data: newBill });
        setSupplierBills(prev => [newBill, ...prev]);
    };
    const updateSupplierBillStatus = async (billId: string, status: SupplierBill['status']) => {
        if (isLiveMode) await api('update', { entity: 'SupplierBills', id: billId, data: { status } });
        setSupplierBills(prev => prev.map(b => b.id === billId ? { ...b, status } : b));
    };
    const bulkDeleteSupplierBills = async (billIds: string[]) => {
        if (isLiveMode) await api('bulkDelete', { entity: 'SupplierBills', ids: billIds });
        setSupplierBills(prev => prev.filter(b => !billIds.includes(b.id)));
    };
    
    const bulkMarkInvoicesAsPaid = async (invoiceIds: string[]) => {
        const updates = invoiceIds.map(id => ({ id, data: { status: 'paid' as 'paid' } }));
        if (isLiveMode) await api('bulkUpdate', { entity: 'Invoices', updates });
        
        const affectedInvoices = invoices.filter(i => invoiceIds.includes(i.id) && i.status !== 'paid');
        if (affectedInvoices.length === 0) return;

        const customerSpendUpdates = new Map<string, number>();
        affectedInvoices.forEach(inv => {
            const currentSpend = customerSpendUpdates.get(inv.customerId) || 0;
            customerSpendUpdates.set(inv.customerId, currentSpend + inv.total);
        });

        setInvoices(prev => prev.map(item => invoiceIds.includes(item.id) ? { ...item, status: 'paid' } : item));
        
        const customerUpdates = Array.from(customerSpendUpdates.entries()).map(([id, amount]) => {
            const customer = customers.find(c => c.id === id);
            return { id, data: { totalSpend: (customer?.totalSpend || 0) + amount } };
        });
        if (isLiveMode) await api('bulkUpdate', { entity: 'Customers', updates: customerUpdates });

        setCustomers(prev => prev.map(cust => {
            if (customerSpendUpdates.has(cust.id)) {
                return { ...cust, totalSpend: cust.totalSpend + (customerSpendUpdates.get(cust.id) || 0) };
            }
            return cust;
        }));
    };

    const bulkMarkSupplierBillsAsPaid = async (billIds: string[]) => {
        const updates = billIds.map(id => ({ id, data: { status: 'paid' as 'paid' } }));
        if (isLiveMode) await api('bulkUpdate', { entity: 'SupplierBills', updates });
        setSupplierBills(prev => prev.map(item => billIds.includes(item.id) ? { ...item, status: 'paid' } : item));
    };

    const markInvoiceAsPaid = async (invoiceId: string) => {
        const invoiceToUpdate = invoices.find(i => i.id === invoiceId);
        if (invoiceToUpdate && invoiceToUpdate.status !== 'paid') {
            await updateInvoice({ ...invoiceToUpdate, status: 'paid' });

            const customer = customers.find(c => c.id === invoiceToUpdate.customerId);
            if (customer) {
                const updatedCustomer = { ...customer, totalSpend: customer.totalSpend + invoiceToUpdate.total };
                if (isLiveMode) await api('update', { entity: 'Customers', id: customer.id, data: { totalSpend: updatedCustomer.totalSpend } });
                setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCustomer : c));
            }
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
        const newCustomer: Customer = { id: `CUST-${Date.now()}`, totalSpend: 0, ...customerData };
        if (isLiveMode) await api('add', { entity: 'Customers', data: newCustomer });
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
    };
    const bulkDeleteCustomers = async (customerIds: string[]) => {
        if (isLiveMode) await api('bulkDelete', { entity: 'Customers', ids: customerIds });
        setCustomers(prev => prev.filter(c => !customerIds.includes(c.id)));
    };
    
    const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
        const newSupplier: Supplier = { id: `SUP-${Date.now()}`, ...supplier };
        if (isLiveMode) await api('add', { entity: 'Suppliers', data: newSupplier });
        setSuppliers(prev => [newSupplier, ...prev]);
    };
    
    const addTraveler = async (traveler: Omit<Traveler, 'id'>) => {
        const newTraveler: Traveler = { id: `TR-${Date.now()}`, ...traveler };
        if (isLiveMode) await api('add', { entity: 'Travelers', data: newTraveler });
        setTravelers(prev => [newTraveler, ...prev]);
    };
    
    const addEmployee = async (employeeData: Omit<User, 'id'>) => {
        const newEmployee: User = { id: `EMP-${Date.now()}`, ...employeeData };
        if (isLiveMode) await api('add', { entity: 'Users', data: newEmployee });
        setEmployees(prev => [newEmployee, ...prev]);
    };
    const updateEmployee = async (updatedEmployee: User) => {
        if (isLiveMode) await api('update', { entity: 'Users', id: updatedEmployee.id, data: updatedEmployee });
        setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    };

    const requestLeave = async (request: Omit<LeaveRequest, 'id' | 'status'>) => {
        const newRequest: LeaveRequest = { id: `LR-${Date.now()}`, status: 'pending', ...request };
        if (isLiveMode) await api('add', { entity: 'LeaveRequests', data: newRequest });
        setLeaveRequests(prev => [newRequest, ...prev]);
    };
    const updateLeaveStatus = async (requestId: string, status: LeaveRequest['status']) => {
        if (isLiveMode) await api('update', { entity: 'LeaveRequests', id: requestId, data: { status } });
        setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    };

    const clockIn = async (userId: string, userName: string) => {
        const newRecord: AttendanceRecord = { id: `ATT-${Date.now()}`, employeeId: userId, employeeName: userName, clockInTime: new Date().toISOString() };
        if (isLiveMode) await api('add', { entity: 'AttendanceLog', data: newRecord });
        setAttendanceLog(prev => [newRecord, ...prev]);
        setCurrentUserAttendanceStatus('in');
    };

    const clockOut = async (userId: string) => {
        const lastRecord = attendanceLog.find(att => att.employeeId === userId && !att.clockOutTime);
        if (lastRecord) {
            const updatedRecord = { ...lastRecord, clockOutTime: new Date().toISOString() };
            if (isLiveMode) await api('update', { entity: 'AttendanceLog', id: lastRecord.id, data: { clockOutTime: updatedRecord.clockOutTime } });
            setAttendanceLog(prev => prev.map(r => r.id === lastRecord.id ? updatedRecord : r));
        }
        setCurrentUserAttendanceStatus('out');
    };

    const initiateHandover = async (handover: Omit<CashHandover, 'id' | 'status' | 'dateInitiated'>) => {
        const newHandover: CashHandover = { id: `CH-${Date.now()}`, status: 'pending', dateInitiated: new Date().toISOString(), ...handover };
        if (isLiveMode) await api('add', { entity: 'CashHandovers', data: newHandover });
        setCashHandovers(prev => [newHandover, ...prev]);
    };
    
    const confirmHandover = async (handoverId: string, managerId: string, managerName: string) => {
        const dataToUpdate = { status: 'confirmed' as 'confirmed', managerId, managerName, dateConfirmed: new Date().toISOString() };
        if (isLiveMode) await api('update', { entity: 'CashHandovers', id: handoverId, data: dataToUpdate });
        setCashHandovers(prev => prev.map(h => h.id === handoverId ? { ...h, ...dataToUpdate } : h));
    };
    
    const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
        const newTask: Task = {
            id: `TASK-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...task
        };
        if (isLiveMode) await api('add', { entity: 'Tasks', data: newTask });
        setTasks(prev => [newTask, ...prev]);
    };

    const updateTask = async (updatedTask: Task) => {
        if (isLiveMode) await api('update', { entity: 'Tasks', id: updatedTask.id, data: updatedTask });
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    return (
        <AppContext.Provider value={{
            isLiveMode,
            backendUrl,
            isLoading,
            setBackendAndSwitchToLive,
            switchToDemoMode,
            language,
            direction,
            toggleLanguage,
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
            tasks,
            addTask,
            updateTask,
            apiClient: api,
            isSearchModalOpen,
            setIsSearchModalOpen,
            globalDetailView,
            setGlobalDetailView,
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
