
import React from 'react';
import type { Task, TaskPriority, User } from '../../types';
import { Calendar, User as UserIcon } from 'lucide-react';
import Card from '../ui/Card';

interface TaskCardProps {
    task: Task;
    assignedUser?: User;
    onClick: () => void;
}

const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-green-600/30', text: 'text-green-300', border: 'border-green-500/50' },
    medium: { bg: 'bg-amber-600/30', text: 'text-amber-300', border: 'border-amber-500/50' },
    high: { bg: 'bg-red-600/30', text: 'text-red-300', border: 'border-red-500/50' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, assignedUser, onClick }) => {
    const { bg, text, border } = priorityStyles[task.priority];

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

    return (
        <Card onClick={onClick} className="p-4 cursor-pointer hover:shadow-red-500/20">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-white mb-2 pr-2">{task.title}</h4>
                 <span className={`px-2 py-0.5 text-xs font-semibold capitalize rounded-full border ${bg} ${text} ${border}`}>
                    {task.priority}
                </span>
            </div>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
            <div className="flex justify-between items-center text-xs text-slate-400">
                <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{assignedUser?.name || 'Unassigned'}</span>
                </div>
            </div>
        </Card>
    );
};

export default TaskCard;
