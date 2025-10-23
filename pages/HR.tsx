
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Mail, MapPin, User as UserIcon, CalendarPlus, UserPlus, Edit, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import LeaveRequestTable from '../components/hr/LeaveRequestTable';
import LeaveRequestFormModal from '../components/hr/LeaveRequestFormModal';
import EmployeeFormModal from '../components/hr/EmployeeFormModal';
import AttendanceLogTable from '../components/hr/AttendanceLogTable';
import type { User } from '../types';

const HRPage: React.FC = () => {
    const { user } = useAuth();
    const { 
        leaveRequests, requestLeave, updateLeaveStatus, 
        employees, addEmployee, updateEmployee,
        attendanceLog
    } = useApp();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            return emp.name.toLowerCase().includes(lowerSearchTerm) ||
                   emp.email.toLowerCase().includes(lowerSearchTerm) ||
                   emp.role.toLowerCase().includes(lowerSearchTerm);
        });
    }, [employees, searchTerm]);
    
    const handleSaveLeaveRequest = (data: { startDate: string; endDate: string; reason: string; }) => {
        if (!user) return;
        requestLeave({
            ...data,
            employeeId: user.id,
            employeeName: user.name,
        });
        setIsLeaveModalOpen(false);
    };

    const handleOpenAddModal = () => {
        setEditingEmployee(null);
        setIsEmployeeModalOpen(true);
    };
    
    const handleOpenEditModal = (employee: User) => {
        setEditingEmployee(employee);
        setIsEmployeeModalOpen(true);
    };

    const handleSaveEmployee = (employeeData: Omit<User, 'id'>, id?: string) => {
        if (id) { // Editing existing employee
            updateEmployee({ ...employeeData, id });
        } else { // Adding new employee
            addEmployee(employeeData);
        }
        setIsEmployeeModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Human Resources</h1>
                    <p className="text-sm text-slate-400">Manage employees, leave, and attendance.</p>
                </div>
                <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                     <Button variant="secondary" onClick={() => setIsLeaveModalOpen(true)} className="flex-1 sm:flex-none">
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Request Leave
                    </Button>
                    <Button onClick={handleOpenAddModal} className="flex-1 sm:flex-none">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Employee
                    </Button>
                </div>
            </div>

            <Card>
                <div className="p-4 sm:p-6 border-b border-slate-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white">Employee Directory</h2>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEmployees.map(u => (
                            <Card key={u.id} className="p-5 text-center hover:shadow-red-500/20 !scale-100 relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => handleOpenEditModal(u)} variant="secondary" className="!p-2 h-8 w-8">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 border-2 border-slate-600">
                                     <UserIcon className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{u.name}</h3>
                                <p className="text-sm text-red-400 capitalize">{u.role}</p>
                                <div className="mt-4 text-left space-y-2 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span>{u.email}</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{u.branch} Branch</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-white">Leave Management</h2>
                    </div>
                    <LeaveRequestTable 
                        requests={leaveRequests} 
                        onApprove={(id) => updateLeaveStatus(id, 'approved')}
                        onReject={(id) => updateLeaveStatus(id, 'rejected')}
                    />
                </Card>
                <Card>
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-white">Attendance Log</h2>
                    </div>
                    <AttendanceLogTable records={attendanceLog} />
                </Card>
            </div>
            
            <LeaveRequestFormModal 
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onSave={handleSaveLeaveRequest}
            />

            <EmployeeFormModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSave={handleSaveEmployee}
                employee={editingEmployee}
            />
        </div>
    );
};

export default HRPage;