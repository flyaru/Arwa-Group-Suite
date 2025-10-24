import React, { createContext, useState, useContext, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DSR, Invoice, SupplierBill, Airport, Route, Customer, LeaveRequest, CashHandover, Supplier, Traveler, User, AttendanceRecord, AuditLogEntry, Task, SupplierBillStatus, LeaveRequestStatus, CashHandoverStatus } from '../types';
import {
    mockUsers, mockCustomers, mockSuppliers, mockTravelers, mockDsrs, mockInvoices,
    mockSupplierBills, mockLeaveRequests, mockCashHandovers, mockAttendanceLog, mockAuditLog,
    mockAirports, mockActiveRoutes, mockTasks
} from '../data/mockData';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../App';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';
type AnimationState = {
    show: boolean;
    type: 'login' | 'logout' | null;
    userName?: string;
};
type GlobalDetailView = { type: 'dsr' | 'invoice', id: string } | null;

// Helper to convert object keys to snake_case for Supabase
const toSnakeCase = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        newObj[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = obj[key];
    }
    return newObj;
};

// Helper to convert object keys to camelCase from Supabase
const fromSnakeCase = (obj: Record<string, any>) => {
    if (!obj) return obj;
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        newObj[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())] = obj[key];
    }
    return newObj;
};

interface AppContextType {
    isLiveMode: boolean;
    supabase: SupabaseClient | null;
    isLoading: boolean;
    
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
    addSupplierBill: (bill: SupplierBill) => Promise<void>;
    updateSupplierBillStatus: (billId: string, status: SupplierBillStatus) => Promise<void>;
    bulkMarkSupplierBillsAsPaid: (billIds: string[]) => Promise<void>;
    bulkDeleteSupplierBills: (billIds: string[]) => Promise<void>;

    handleInvoiceViewedAndLockDsr: (invoiceId: string) => Promise<void>;

    airports: Airport[];
    activeRoutes: Route[];
    
    customers: Customer[];
    addCustomer: (customer: Customer) => Promise<Customer>;
    bulkDeleteCustomers: (customerIds: string[]) => Promise<void>;

    suppliers: Supplier[];
    addSupplier: (supplier: Supplier) => Promise<void>;

    travelers: Traveler[];
    addTraveler: (traveler: Traveler) => Promise<void>;
    
    employees: User[];
    addEmployee: (employee: User) => Promise<void>;
    updateEmployee: (updatedEmployee: User) => Promise<void>;

    leaveRequests: LeaveRequest[];
    requestLeave: (request: LeaveRequest) => Promise<void>;
    updateLeaveStatus: (requestId: string, status: LeaveRequestStatus) => Promise<void>;

    cashHandovers: CashHandover[];
    initiateHandover: (handover: CashHandover) => Promise<void>;
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
    addTask: (task: Task) => Promise<void>;
    updateTask: (updatedTask: Task) => Promise<void>;
    
    isSearchModalOpen: boolean;
    setIsSearchModalOpen: Dispatch<SetStateAction<boolean>>;
    globalDetailView: GlobalDetailView;
    setGlobalDetailView: (view: GlobalDetailView) => void;
    // FIX: Added missing properties to the context type to resolve errors in BackendConfiguration.tsx.
    setBackendAndSwitchToLive: (url: string, key: string) => Promise<boolean>;
    switchToDemoMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // UI and Mode State
    const [language, setLanguage] = useState<Language>('en');
    const [direction, setDirection] = useState<Direction>('ltr');
    const [animationState, setAnimationState] = useState<AnimationState>({ show: false, type: null, userName: '' });
    
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    const fetchAllData = async (client: SupabaseClient) => {
        setIsLoading(true);
        try {
            const [
                dsrsRes, invoicesRes, billsRes, customersRes, suppliersRes,
                travelersRes, employeesRes, leaveRes, handoverRes, attendanceRes, auditRes, tasksRes
            ] = await Promise.all([
                client.from('dsrs').select('*').order('created_at', { ascending: false }),
                client.from('invoices').select('*').order('date', { ascending: false }),
                client.from('supplier_bills').select('*').order('date', { ascending: false }),
                client.from('customers').select('*').order('name'),
                client.from('suppliers').select('*').order('name'),
                client.from('travelers').select('*').order('name'),
                client.from('profiles').select('*').order('name'),
                client.from('leave_requests').select('*').order('start_date', { ascending: false }),
                client.from('cash_handovers').select('*').order('date_initiated', { ascending: false }),
                client.from('attendance_log').select('*').order('clock_in_time', { ascending: false }),
                client.from('audit_log').select('*').order('timestamp', { ascending: false }),
                client.from('tasks').select('*').order('created_at', { ascending: false }),
            ]);

            if (dsrsRes.error) throw dsrsRes.error;
            setDsrs(dsrsRes.data.map(d => fromSnakeCase(d)) as DSR[]);
            if (invoicesRes.error) throw invoicesRes.error;
            setInvoices(invoicesRes.data.map(i => fromSnakeCase(i)) as Invoice[]);
            if (billsRes.error) throw billsRes.error;
            setSupplierBills(billsRes.data.map(b => fromSnakeCase(b)) as SupplierBill[]);
            if (customersRes.error) throw customersRes.error;
            setCustomers(customersRes.data.map(c => fromSnakeCase(c)) as Customer[]);
            if (suppliersRes.error) throw suppliersRes.error;
            setSuppliers(suppliersRes.data.map(s => fromSnakeCase(s)) as Supplier[]);
            if (travelersRes.error) throw travelersRes.error;
            setTravelers(travelersRes.data.map(t => fromSnakeCase(t)) as Traveler[]);
            if (employeesRes.error) throw employeesRes.error;
            setEmployees(employeesRes.data.map(e => fromSnakeCase(e)) as User[]);
            if (leaveRes.error) throw leaveRes.error;
            setLeaveRequests(leaveRes.data.map(r => fromSnakeCase(r)) as LeaveRequest[]);
            if (handoverRes.error) throw handoverRes.error;
            setCashHandovers(handoverRes.data.map(h => fromSnakeCase(h)) as CashHandover[]);
            if (attendanceRes.error) throw attendanceRes.error;
            setAttendanceLog(attendanceRes.data.map(a => fromSnakeCase(a)) as AttendanceRecord[]);
            if (auditRes.error) throw auditRes.error;
            setAuditLog(auditRes.data.map(a => fromSnakeCase(a)) as AuditLogEntry[]);
            if (tasksRes.error) throw tasksRes.error;
            setTasks(tasksRes.data.map(t => fromSnakeCase(t)) as Task[]);

        } catch (error: any) {
            console.error("Failed to fetch all data:", error.message || error);
            // Re-throw so the caller can handle it (e.g., switch to demo mode)
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const resetToMockData = () => {
        setDsrs(mockDsrs);
        setInvoices(mockInvoices);
        setSupplierBills(mockSupplierBills);
        setCustomers(mockCustomers);
        setSuppliers(mockSuppliers);
        setTravelers(mockTravelers);
        setEmployees(mockUsers);
        setLeaveRequests(mockLeaveRequests);
        setCashHandovers(mockCashHandovers);
        setAttendanceLog(mockAttendanceLog);
        setAuditLog(mockAuditLog);
        setTasks(mockTasks);
    };

    const switchToDemoMode = () => {
        setIsLiveMode(false);
        setSupabase(null);
        localStorage.removeItem('supabaseUrl_arwa');
        localStorage.removeItem('supabaseAnonKey_arwa');
        setIsLoading(true);
        // Simulate loading mock data to show loading screen
        setTimeout(() => {
            resetToMockData();
            setIsLoading(false);
        }, 500);
    };

    const setBackendAndSwitchToLive = async (url: string, key: string): Promise<boolean> => {
        try {
            const testClient = createClient(url, key);
            // A quick check to see if the client can connect and has basic permissions.
            const { error } = await testClient.from('customers').select('id', { count: 'exact', head: true });
            if (error) throw error;

            await fetchAllData(testClient); // This will throw on failure, preventing inconsistent state

            // Success, now commit to live mode state
            localStorage.setItem('supabaseUrl_arwa', url);
            localStorage.setItem('supabaseAnonKey_arwa', key);

            setSupabase(testClient);
            setIsLiveMode(true);
            return true;
        } catch (error: any) {
            console.error("Failed to switch to live mode:", error.message);
            alert(`Failed to connect to the backend: ${error.message || 'Unknown error'}. Check your Supabase credentials and Row Level Security policies. Reverting to Demo Mode.`);
            switchToDemoMode(); // This will reset state and mock data
            return false;
        }
    };
    
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
    }, [language, direction]);

    useEffect(() => {
        // Hardcoded to always start in live mode using credentials from App.tsx.
        setBackendAndSwitchToLive(SUPABASE_URL, SUPABASE_ANON_KEY);
    }, []);
    
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
        setAuditLog(prev => [newLogEntry, ...prev]);
        if (isLiveMode && supabase) {
            await supabase.from('audit_log').insert(toSnakeCase(logData));
        }
    };

    const triggerAnimation = (type: AnimationState['type'], userName?: string, callback?: () => void) => {
        setAnimationState({ show: true, type, userName });
        setTimeout(() => {
            if (callback) callback();
            setAnimationState({ show: false, type: null, userName: '' });
        }, 2500);
    };
    
    // --- Data Mutation Functions ---

    const genericAdd = async <T,>(table: string, data: T, setState: Dispatch<SetStateAction<T[]>>): Promise<T> => {
        const { id, ...insertData } = data as any;
        if (isLiveMode && supabase) {
            const { data: result, error } = await supabase.from(table).insert(toSnakeCase(insertData)).select().single();
            if (error) throw error;
            const newRecord = fromSnakeCase(result) as T;
            setState(prev => [newRecord, ...prev]);
            return newRecord;
        }
        setState(prev => [data, ...prev]);
        return data;
    }

    const genericUpdate = async <T extends {id: string}>(table: string, updatedRecord: T, setState: Dispatch<SetStateAction<T[]>>) => {
        setState(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
        if (isLiveMode && supabase) {
            const { id, ...updateData } = updatedRecord;
            const { error } = await supabase.from(table).update(toSnakeCase(updateData)).eq('id', id);
            if (error) console.error(`Error updating ${table}:`, error);
        }
    }

    const genericBulkDelete = async (table: string, ids: string[], setState: Dispatch<SetStateAction<any[]>>) => {
        setState(prev => prev.filter(item => !ids.includes(item.id)));
        if (isLiveMode && supabase) {
            const { error } = await supabase.from(table).delete().in('id', ids);
            if (error) console.error(`Error bulk deleting ${table}:`, error);
        }
    };
    
    const addDsr = async (dsr: DSR) => { await genericAdd('dsrs', dsr, setDsrs); };
    const updateDsr = async (updatedDsr: DSR) => { await genericUpdate('dsrs', updatedDsr, setDsrs); };
    const bulkDeleteDsrs = async (dsrIds: string[]) => { await genericBulkDelete('dsrs', dsrIds, setDsrs); };

    const addInvoice = async (invoice: Invoice) => { await genericAdd('invoices', invoice, setInvoices); };
    const updateInvoice = async (updatedInvoice: Invoice) => { await genericUpdate('invoices', updatedInvoice, setInvoices); };
    const bulkDeleteInvoices = async (invoiceIds: string[]) => { await genericBulkDelete('invoices', invoiceIds, setInvoices); };

    const addSupplierBill = async (bill: SupplierBill) => { await genericAdd('supplier_bills', bill, setSupplierBills); };
    const updateSupplierBillStatus = async (billId: string, status: SupplierBillStatus) => {
        setSupplierBills(prev => prev.map(b => b.id === billId ? { ...b, status } : b));
        if(isLiveMode && supabase) await supabase.from('supplier_bills').update({ status }).eq('id', billId);
    };
    const bulkDeleteSupplierBills = async (billIds: string[]) => { await genericBulkDelete('supplier_bills', billIds, setSupplierBills); };
    
    const addCustomer = async (customer: Customer) => await genericAdd('customers', customer, setCustomers);
    const bulkDeleteCustomers = async (customerIds: string[]) => { await genericBulkDelete('customers', customerIds, setCustomers); };
    
    const addSupplier = async (supplier: Supplier) => { await genericAdd('suppliers', supplier, setSuppliers); };
    const addTraveler = async (traveler: Traveler) => { await genericAdd('travelers', traveler, setTravelers); };
    const addEmployee = async (employee: User) => { await genericAdd('profiles', employee, setEmployees); };
    const updateEmployee = async (updatedEmployee: User) => { await genericUpdate('profiles', updatedEmployee, setEmployees); };

    const requestLeave = async (request: LeaveRequest) => { await genericAdd('leave_requests', request, setLeaveRequests); };
    const updateLeaveStatus = async (requestId: string, status: LeaveRequestStatus) => {
        setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
        if (isLiveMode && supabase) await supabase.from('leave_requests').update({ status }).eq('id', requestId);
    };
    
    const initiateHandover = async (handover: CashHandover) => { await genericAdd('cash_handovers', handover, setCashHandovers); };
    const confirmHandover = async (handoverId: string, managerId: string, managerName: string) => {
        const dataToUpdate = { status: 'confirmed' as CashHandoverStatus, managerId, managerName, dateConfirmed: new Date().toISOString() };
        setCashHandovers(prev => prev.map(h => h.id === handoverId ? { ...h, ...dataToUpdate } : h));
        if(isLiveMode && supabase) await supabase.from('cash_handovers').update(toSnakeCase(dataToUpdate)).eq('id', handoverId);
    };
    
    const clockIn = async (userId: string, userName: string) => {
        setCurrentUserAttendanceStatus('in');
        const newRecord: AttendanceRecord = { id: `ATT-${Date.now()}`, employeeId: userId, employeeName: userName, clockInTime: new Date().toISOString() };
        const savedRecord = await genericAdd('attendance_log', newRecord, setAttendanceLog);
        setAttendanceLog(prev => prev.map(r => r.id === newRecord.id ? savedRecord : r));
    };

    const clockOut = async (userId: string) => {
        setCurrentUserAttendanceStatus('out');
        const lastRecord = attendanceLog.find(att => att.employeeId === userId && !att.clockOutTime);
        if (lastRecord) {
            const updatedRecord = { ...lastRecord, clockOutTime: new Date().toISOString() };
            await genericUpdate('attendance_log', updatedRecord, setAttendanceLog);
        }
    };
    
    const addTask = async (task: Task) => { await genericAdd('tasks', task, setTasks); };
    const updateTask = async (updatedTask: Task) => { await genericUpdate('tasks', updatedTask, setTasks); };

    const bulkMarkInvoicesAsPaid = async (invoiceIds: string[]) => {
        if (isLiveMode && supabase) {
            await Promise.all(invoiceIds.map(id => markInvoiceAsPaid(id)));
        } else {
             // Demo mode logic
            setInvoices(prev => prev.map(item => invoiceIds.includes(item.id) ? { ...item, status: 'paid' } : item));
        }
    };

    const bulkMarkSupplierBillsAsPaid = async (billIds: string[]) => {
        setSupplierBills(prev => prev.map(item => billIds.includes(item.id) ? { ...item, status: 'paid' } : item));
        if(isLiveMode && supabase) {
            await supabase.from('supplier_bills').update({ status: 'paid' }).in('id', billIds);
        }
    };

    const markInvoiceAsPaid = async (invoiceId: string) => {
        const invoiceToUpdate = invoices.find(i => i.id === invoiceId);
        if (invoiceToUpdate && invoiceToUpdate.status !== 'paid') {
            await updateInvoice({ ...invoiceToUpdate, status: 'paid' });

            const customer = customers.find(c => c.id === invoiceToUpdate.customerId);
            if(customer) {
                const updatedCustomer = { ...customer, totalSpend: customer.totalSpend + invoiceToUpdate.total };
                setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCustomer : c));
                 if(isLiveMode && supabase) await supabase.from('customers').update({ total_spend: updatedCustomer.totalSpend }).eq('id', customer.id);
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


    return (
        <AppContext.Provider value={{
            isLiveMode,
            supabase,
            isLoading,
            language,
            direction,
            toggleLanguage,
            dsrs, addDsr, updateDsr, bulkDeleteDsrs,
            invoices, addInvoice, updateInvoice, markInvoiceAsPaid, bulkMarkInvoicesAsPaid, bulkDeleteInvoices,
            supplierBills, addSupplierBill, updateSupplierBillStatus, bulkMarkSupplierBillsAsPaid, bulkDeleteSupplierBills,
            handleInvoiceViewedAndLockDsr,
            airports,
            activeRoutes,
            customers, addCustomer, bulkDeleteCustomers,
            suppliers, addSupplier,
            travelers, addTraveler,
            employees, addEmployee, updateEmployee,
            leaveRequests, requestLeave, updateLeaveStatus,
            cashHandovers, initiateHandover, confirmHandover,
            animationState,
            triggerAnimation,
            attendanceLog, currentUserAttendanceStatus, clockIn, clockOut,
            auditLog, logAction,
            tasks, addTask, updateTask,
            isSearchModalOpen,
            setIsSearchModalOpen,
            globalDetailView,
            setGlobalDetailView,
            setBackendAndSwitchToLive,
            switchToDemoMode,
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
