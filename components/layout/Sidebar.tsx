
import React from 'react';
import { NavLink } from 'react-router-dom';
import ArwaLogo from '../common/Logo';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    const accessibleLinks = user 
        ? NAV_LINKS.filter(link => link.roles.includes(user.role))
        : [];

    return (
        <aside 
            className={`
                bg-[#0B2D48]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col
                fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-30
                lg:relative lg:translate-x-0 lg:w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className="h-20 flex items-center px-6 border-b border-white/10">
                <ArwaLogo />
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {accessibleLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={onClose} // Close sidebar on mobile navigation
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                isActive
                                    ? 'bg-[#D10028] text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-white/10">
                 <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-400 capitalize truncate">{user?.role || 'Admin'} • {user?.branch || 'Riyadh'}</p>
                    </div>
                    <button onClick={logout} className="ml-2 text-slate-400 hover:text-[#D10028] transition-colors flex-shrink-0">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;