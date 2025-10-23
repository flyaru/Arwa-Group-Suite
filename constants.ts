
import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    Plane,
    Building,
    Receipt,
    Wallet,
    Briefcase,
    Megaphone,
    BarChart3,
    Settings,
    Shield,
    History,
    FileArchive,
    Bot
} from 'lucide-react';
import type { User } from './types';

export const ALL_ROLES: User['role'][] = ['admin', 'manager', 'supervisor', 'accountant', 'hr', 'agent'];
export const MANAGER_ROLES: User['role'][] = ['admin', 'manager', 'supervisor'];
export const AGENT_ROLES: User['role'][] = ['admin', 'manager', 'supervisor', 'agent'];
export const FINANCE_ROLES: User['role'][] = ['admin', 'manager', 'supervisor', 'accountant'];

export const NAV_LINKS: { name: string; path: string; icon: React.ElementType; roles: User['role'][] }[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
    { name: 'DSRs', path: '/dsrs', icon: FileText, roles: AGENT_ROLES },
    { name: 'Customers', path: '/customers', icon: Users, roles: AGENT_ROLES },
    { name: 'Travelers', path: '/travelers', icon: Plane, roles: AGENT_ROLES },
    { name: 'Suppliers', path: '/suppliers', icon: Building, roles: MANAGER_ROLES },
    { name: 'Supplier Bills', path: '/supplier-bills', icon: FileArchive, roles: FINANCE_ROLES },
    { name: 'Invoices', path: '/invoices', icon: Receipt, roles: FINANCE_ROLES },
    { name: 'AI Reconciliation', path: '/reconciliation', icon: Bot, roles: FINANCE_ROLES },
    { name: 'Cash', path: '/cash', icon: Wallet, roles: ['admin', 'manager', 'supervisor', 'accountant', 'agent'] },
    { name: 'HR', path: '/hr', icon: Briefcase, roles: ['admin', 'hr'] },
    { name: 'Campaigns', path: '/campaigns', icon: Megaphone, roles: ['admin', 'manager'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: MANAGER_ROLES },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ALL_ROLES },
    { name: 'Admin', path: '/admin', icon: Shield, roles: ['admin'] },
    { name: 'Audit Log', path: '/audit-log', icon: History, roles: ['admin'] },
];
