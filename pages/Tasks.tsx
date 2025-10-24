
import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import KanbanColumn from '../components/tasks/KanbanColumn';
import TaskFormModal from '../components/tasks/TaskFormModal';
import type { Task, User } from '../types';

const TasksPage: React.FC = () => {
    const { tasks, employees, addTask, updateTask } = useApp();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const userMap = useMemo(() => new Map<string, User>(employees.map(u => [u.id, u])), [employees]);

    const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
    const inProgressTasks = useMemo(() => tasks.filter(t => t.status === 'in-progress'), [tasks]);
    const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);

    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (data: Omit<Task, 'id' | 'createdAt' | 'createdBy'>, id?: string) => {
        if (!user) return;

        if (id) { // Editing
            const originalTask = tasks.find(t => t.id === id);
            if (originalTask) {
                updateTask({ ...originalTask, ...data });
            }
        } else { // Creating
            addTask({ ...data, createdBy: user.id });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Task Management</h1>
                    <p className="text-sm text-slate-400">Organize your team's work with a Kanban board.</p>
                </div>
                <Button onClick={handleOpenCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                </Button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                <KanbanColumn 
                    title="To Do" 
                    tasks={todoTasks} 
                    userMap={userMap} 
                    onTaskClick={handleOpenEditModal} 
                />
                <KanbanColumn 
                    title="In Progress" 
                    tasks={inProgressTasks} 
                    userMap={userMap} 
                    onTaskClick={handleOpenEditModal} 
                />
                <KanbanColumn 
                    title="Done" 
                    tasks={doneTasks} 
                    userMap={userMap} 
                    onTaskClick={handleOpenEditModal} 
                />
            </div>

            <TaskFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={editingTask}
                employees={employees}
            />
        </div>
    );
};

export default TasksPage;
