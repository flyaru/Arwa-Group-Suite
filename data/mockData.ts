import type { User, Customer, Supplier, Traveler, DSR, Invoice, SupplierBill, LeaveRequest, CashHandover, AttendanceRecord, AuditLogEntry, Airport, Route, Task } from '../types';

export const mockUsers: User[] = [
    { id: '1', username: 'gm', role: 'admin', branch: 'Riyadh', name: 'General Manager', email: 'gm@arwatravelksa.com' },
    { id: '2', username: 'manager', role: 'manager', branch: 'Riyadh', name: 'Sales Manager', email: 'manager@arwa.tech' },
    { id: '3', username: 'agent', role: 'agent', branch: 'Jeddah', name: 'Sales Agent', email: 'agent@arwa.tech' },
    { id: '4', username: 'accountant', role: 'accountant', branch: 'Riyadh', name: 'Finance Accountant', email: 'accountant@arwa.tech' },
    { id: '5', username: 'hr', role: 'hr', branch: 'Riyadh', name: 'HR Specialist', email: 'hr@arwa.tech' },
    { id: '6', username: 'supervisor', role: 'supervisor', branch: 'Dammam', name: 'Team Supervisor', email: 'supervisor@arwa.tech' },
];

export const mockCustomers: Customer[] = [
    { id: 'CUST-1', name: 'Saudi Aramco', phone: '+966501234567', email: 'contact@aramco.com', type: 'corporate', totalSpend: 45000 },
    { id: 'CUST-2', name: 'Abdullah Al-Qahtani', phone: '+966559876543', email: 'a.qahtani@example.com', type: 'individual', totalSpend: 8250 },
    { id: 'CUST-3', name: 'STC Solutions', phone: '+966533219876', email: 'info@stcs.com.sa', type: 'corporate', totalSpend: 19800 },
    { id: 'CUST-4', name: 'Fatima Al-Zahrani', phone: '+966567891234', email: 'f.zahrani@example.com', type: 'individual', totalSpend: 12000 },
];

export const mockSuppliers: Supplier[] = [
    { id: 'SUP-1', name: 'Saudia Airlines', type: 'airline' },
    { id: 'SUP-2', name: 'Sabre GDS', type: 'gds' },
    { id: 'SUP-3', name: 'Hilton Hotels', type: 'hotelier' },
    { id: 'SUP-4', name: 'Amadeus', type: 'gds' },
];

export const mockTravelers: Traveler[] = [
    { id: 'TR-1', name: 'John Doe', passportNo: 'A12345678', nationality: 'American', customerId: 'CUST-1' },
    { id: 'TR-2', name: 'Jane Smith', passportNo: 'B87654321', nationality: 'British', customerId: 'CUST-1' },
];

export const mockDsrs: DSR[] = [
    { id: 'DSR-1', date: '2024-07-20', agentUsername: 'agent', agentName: 'Sales Agent', customerId: 'CUST-2', supplierId: 'SUP-1', serviceType: 'flight', pnr: 'AB1CDE', ticketNo: '157-1234567890', route: 'JED-DXB-JED', sellingFare: 2300, status: 'approved', baseFare: 1800, taxes: 400, discount: 0, netFare: 2100, commission: 200, vatOnCommission: 30, paymentMethod: 'card', remarks: 'Customer requested an aisle seat.' },
    { id: 'DSR-2', date: '2024-07-21', agentUsername: 'agent', agentName: 'Sales Agent', customerId: 'CUST-1', supplierId: 'SUP-1', serviceType: 'flight', pnr: 'FG2HIJ', ticketNo: '157-9876543210', route: 'RUH-LHR-RUH', sellingFare: 4500, status: 'posted', baseFare: 3800, taxes: 500, discount: 0, netFare: 4200, commission: 300, vatOnCommission: 45, paymentMethod: 'credit' },
    { id: 'DSR-3', date: '2024-07-22', agentUsername: 'manager', agentName: 'Sales Manager', customerId: 'CUST-3', supplierId: 'SUP-3', serviceType: 'hotel', pnr: 'HLMNO4', ticketNo: 'N/A', route: 'Jeddah Hilton - 3 Nights', sellingFare: 1700, status: 'submitted', baseFare: 1600, taxes: 0, discount: 0, netFare: 1550, commission: 150, vatOnCommission: 22.5, paymentMethod: 'credit', remarks: 'Corporate booking, direct bill to STC Solutions.' },
    { id: 'DSR-4', date: '2024-07-23', agentUsername: 'agent', agentName: 'Sales Agent', customerId: 'CUST-4', serviceType: 'visa', pnr: 'VSAPQR5', ticketNo: 'N/A', route: 'Schengen Visa Service', sellingFare: 850, status: 'draft', baseFare: 800, taxes: 0, discount: 0, netFare: 750, commission: 100, vatOnCommission: 15, paymentMethod: 'cash' },
];

export const mockInvoices: Invoice[] = [
    { id: 'INV-1', invoiceNo: 'INV-2024-0001', date: '2024-07-20', customerId: 'CUST-2', dsrId: 'DSR-1', items: [{id:'1', description: 'Flight - JED-DXB-JED', qty: 1, unitPrice: 2300, lineTotal: 2300}], subtotal: 2300, vat: 30, total: 2330, status: 'paid' },
    { id: 'INV-2', invoiceNo: 'INV-2024-0002', date: '2024-07-21', customerId: 'CUST-1', dsrId: 'DSR-2', items: [{id:'1', description: 'Flight - RUH-LHR-RUH', qty: 1, unitPrice: 4500, lineTotal: 4500}], subtotal: 4500, vat: 45, total: 4545, status: 'ready' },
];

export const mockSupplierBills: SupplierBill[] = [
    { id: 'BILL-1', billNo: 'SA-54321', supplierId: 'SUP-1', dsrId: 'DSR-1', date: '2024-07-20', total: 2100, status: 'unpaid' },
    { id: 'BILL-2', billNo: 'SA-54322', supplierId: 'SUP-1', dsrId: 'DSR-2', date: '2024-07-21', total: 4200, status: 'paid' },
];

export const mockLeaveRequests: LeaveRequest[] = [
    { id: 'LR-1', employeeId: '3', employeeName: 'Sales Agent', startDate: '2024-08-01', endDate: '2024-08-05', reason: 'Annual Leave', status: 'approved' },
    { id: 'LR-2', employeeId: '2', employeeName: 'Sales Manager', startDate: '2024-08-10', endDate: '2024-08-12', reason: 'Personal Matter', status: 'pending' },
];

export const mockCashHandovers: CashHandover[] = [
    { id: 'CH-1', agentId: '3', agentName: 'Sales Agent', managerId: '2', managerName: 'Sales Manager', amount: 500, dateInitiated: '2024-07-22T10:00:00Z', dateConfirmed: '2024-07-22T11:00:00Z', status: 'confirmed' },
];

export const mockAttendanceLog: AttendanceRecord[] = [
    { id: 'ATT-1', employeeId: '3', employeeName: 'Sales Agent', clockInTime: '2024-07-23T09:00:00Z', clockOutTime: '2024-07-23T17:00:00Z' },
    { id: 'ATT-2', employeeId: '2', employeeName: 'Sales Manager', clockInTime: '2024-07-23T08:45:00Z' },
];

export const mockAuditLog: AuditLogEntry[] = [
    { id: 'LOG-1', timestamp: '2024-07-23T09:00:00Z', userId: '3', userName: 'Sales Agent', action: 'USER_LOGIN', details: 'User Sales Agent logged in.' },
];

export const mockAirports: Airport[] = [
    { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', x: 200, y: 80 },
    { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', x: 50, y: 100 },
    { code: 'DMM', name: 'King Fahd International', city: 'Dammam', x: 250, y: 120 },
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', x: 280, y: 50 },
    { code: 'CAI', name: 'Cairo International', city: 'Cairo', x: 20, y: 40 },
    { code: 'LHR', name: 'London Heathrow', city: 'London', x: 100, y: 10 },
];

export const mockActiveRoutes: Route[] = [
    { from: 'RUH', to: 'DXB' },
    { from: 'JED', to: 'CAI' },
    { from: 'DMM', to: 'DXB' },
    { from: 'RUH', to: 'LHR' },
];

export const mockTasks: Task[] = [
    { id: 'TASK-1', title: 'Follow up with Saudi Aramco', description: 'Contact Mr. Ahmed regarding the new corporate travel package.', status: 'todo', priority: 'high', dueDate: '2024-08-05', assignedTo: '2', createdBy: '1', createdAt: '2024-07-28T10:00:00Z' },
    { id: 'TASK-2', title: 'Prepare Q3 Sales Report', description: 'Compile all sales data for the third quarter and create a summary report.', status: 'in-progress', priority: 'medium', dueDate: '2024-08-15', assignedTo: '4', createdBy: '2', createdAt: '2024-07-25T14:30:00Z' },
    { id: 'TASK-3', title: 'Finalize Jeddah branch marketing materials', description: 'Review and approve the final designs for the new marketing brochures.', status: 'todo', priority: 'medium', dueDate: '2024-08-10', assignedTo: '3', createdBy: '2', createdAt: '2024-07-29T09:00:00Z' },
    { id: 'TASK-4', title: 'Audit end-of-month DSRs', description: 'Verify all DSRs submitted in the last week of July for accuracy.', status: 'done', priority: 'high', dueDate: '2024-08-01', assignedTo: '6', createdBy: '1', createdAt: '2024-07-26T11:00:00Z' },
    { id: 'TASK-5', title: 'Onboard new hire', description: 'Complete the HR onboarding process for the new agent.', status: 'in-progress', priority: 'low', dueDate: '2024-08-08', assignedTo: '5', createdBy: '1', createdAt: '2024-07-30T16:00:00Z' },
];