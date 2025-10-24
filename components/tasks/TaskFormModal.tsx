
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Task, User } from '../../types';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Task, 'id' | 'createdAt' | 'createdBy'>, id?: string) => void;
    taskToEdit: Task | null;
    employees: User[];
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit, employees }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [status, setStatus] = useState<Task['status']>('todo');

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setAssignedTo(taskToEdit.assignedTo);
            setDueDate(taskToEdit.dueDate);
            setPriority(taskToEdit.priority);
            setStatus(taskToEdit.status);
        } else {
            // Reset form for new task
            setTitle('');
            setDescription('');
            setAssignedTo('');
            setDueDate('');
            setPriority('medium');
            setStatus('todo');
        }
    }, [taskToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assignedTo || !dueDate) {
            alert('Please fill all required fields.');
            return;
        }
        
        onSave(
            { title, description, assignedTo, dueDate, priority, status },
            taskToEdit?.id
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit Task' : 'Create New Task'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Task Title" id="taskTitle" value={title} onChange={e => setTitle(e.target.value)} required />
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 border-slate-600 focus:ring-[#D10028]/80 resize-vertical"
                        placeholder="Add more details about the task..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Assign To" id="assignedTo" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
                        <option value="">Select an employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </Select>
                    <Input label="Due Date" id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Priority" id="priority" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </Select>
                    <Select label="Status" id="status" value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </Select>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Task</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskFormModal;
