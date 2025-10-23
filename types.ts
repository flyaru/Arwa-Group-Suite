
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'supervisor' | 'accountant' | 'hr' | 'agent';
  branch: string;
  name: string;
  email: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    type: 'individual' | 'corporate';
    totalSpend: number;
}

export type DSRStatus = 'draft' | 'submitted' | 'approved' | 'posted';

export interface DSR {
    id:string;
    date: string;
    agentUsername: string;
    agentName?: string;
    customerId: string;
    travelerId?: string;
    supplierId?: string;
    serviceType: 'flight' | 'hotel' | 'visa' | 'other';
    pnr: string;
    ticketNo: string;
    route: string;
    sellingFare: number;
    status: DSRStatus;
    baseFare: number;
    taxes: number;
    discount: number;
    netFare: number;
    commission: number;
    vatOnCommission: number;
    paymentMethod: 'cash' | 'card' | 'credit';
    airline?: string;
    remarks?: string;
}

export type InvoiceStatus = 'draft' | 'ready' | 'paid' | 'void';

export interface InvoiceItem {
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    date: string;
    customerId: string;
    dsrId: string;
    items: InvoiceItem[];
    subtotal: number;
    vat: number;
    total: number;
    status: InvoiceStatus;
    qrCodeTlv?: string;
    firstViewedAt?: string;
}

export interface Supplier {
    id: string;
    name: string;
    type: 'airline' | 'hotelier' | 'gds' | 'other';
}

export type SupplierBillStatus = 'unpaid' | 'paid' | 'void';

export interface SupplierBill {
    id: string;
    billNo: string;
    supplierId: string;
    dsrId: string;
    date: string;
    total: number;
    status: SupplierBillStatus;
}

export interface Traveler {
    id: string;
    name: string;
    passportNo: string;
    nationality: string;
    customerId: string;
}

export interface Airport {
    code: string;
    name: string;
    city: string;
    x: number;
    y: number;
}

export interface Route {
    from: string;
    to: string;
}

export interface Campaign {
    id: string;
    name: string;
    subject: string;
    body: string;
    recipientSegment: 'all' | 'corporate' | 'individual';
    status: 'sent' | 'draft';
    sentDate: string;
    recipients: number;
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveRequestStatus;
}

export type CashHandoverStatus = 'pending' | 'confirmed';

export interface CashHandover {
    id: string;
    agentId: string;
    agentName: string;
    managerId?: string;
    managerName?: string;
    amount: number;
    dateInitiated: string;
    dateConfirmed?: string;
    status: CashHandoverStatus;
}

// AI Reconciliation Types
export interface MatchedTransaction {
    statementLine: string;
    dsrId: string;
    pnr: string;
    amount: number;
}

export interface UnmatchedItem {
    line: string;
    reason: string;
}

export interface ReconciliationResult {
    matched: MatchedTransaction[];
    unmatchedInStatement: UnmatchedItem[];
    unmatchedInDSRs: UnmatchedItem[];
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    clockInTime: string;
    clockOutTime?: string;
}

export type AuditLogAction = 
  | 'USER_LOGIN' | 'USER_LOGOUT'
  | 'CREATE_DSR' | 'UPDATE_DSR_STATUS' | 'DELETE_DSR'
  | 'CREATE_INVOICE' | 'UPDATE_INVOICE_STATUS' | 'DELETE_INVOICE'
  | 'CREATE_CUSTOMER' | 'DELETE_CUSTOMER';


export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditLogAction;
  details: string;
  targetId?: string;
}
