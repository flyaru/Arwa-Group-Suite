
import React from 'react';
import type { Task, TaskStatus, User } from '../../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
    title: string;
    tasks: Task[];
    userMap: Map<string, User>;
    onTaskClick: (task: Task) => void;
}

const statusColors: Record<TaskStatus, string> = {
    todo: 'border-sky-500',
    'in-progress': 'border-amber-500',
    done: 'border-green-500',
};


const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tasks, userMap, onTaskClick }) => {
    const status = title.toLowerCase().replace(' ', '-') as TaskStatus;

    return (
        <div className="bg-slate-900/40 rounded-xl flex flex-col h-full">
            <div className={`flex items-center justify-between p-4 border-b-2 ${statusColors[status]}`}>
                <h3 className="font-bold text-white">{title}</h3>
                <span className="text-sm font-bold text-slate-400 bg-slate-800/60 rounded-full px-2.5 py-1">
                    {tasks.length}
                </span>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id}
                        task={task}
                        assignedUser={userMap.get(task.assignedTo)}
                        onClick={() => onTaskClick(task)}
                    />
                ))}
                 {tasks.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm text-slate-500">No tasks here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
