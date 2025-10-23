import React from 'react';
import { NavLink } from 'react-router-dom';
import ArwaLogo from '../common/Logo';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
    const { user } = useAuth();

    const accessibleLinks = user 
        ? NAV_LINKS.filter(link => link.roles.includes(user.role))
        : [];

    return (
        <aside className="w-64 bg-[#0B2D48]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col z-10">
            <div className="h-20 flex items-center px-6">
                <ArwaLogo />
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {accessibleLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
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
        </aside>
    );
};

export default Sidebar;