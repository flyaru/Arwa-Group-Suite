
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Bell, LogOut, User as UserIcon, Clock, Menu, Search } from 'lucide-react';
import { NAV_LINKS } from '../../constants';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { currentUserAttendanceStatus, clockIn, clockOut, setIsSearchModalOpen } = useApp();
    const location = useLocation();

    const currentLink = NAV_LINKS.find(link => location.pathname.startsWith(link.path));
    const pageTitle = currentLink ? currentLink.name : 'Welcome';
    
    const pageSubtitles: { [key: string]: string } = {
        'Dashboard': "Welcome back! Here's your overview.",
        'DSRs': "Manage all Daily Sales Reports.",
        'Customers': "Browse and manage customer profiles.",
        'Settings': "Configure your application settings.",
    };

    const pageSubtitle = pageSubtitles[pageTitle] || `Manage your ${pageTitle.toLowerCase()}`;
    
    const handleClockToggle = () => {
        if (!user) return;
        if (currentUserAttendanceStatus === 'out') {
            clockIn(user.id, user.name);
        } else {
            clockOut(user.id);
        }
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 120,
        },
      },
    };

    return (
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 md:px-6 lg:px-8 bg-transparent border-b border-white/10">
            <div className="flex items-center gap-4">
                 <button 
                    onClick={onMenuClick}
                    className="lg:hidden text-slate-300 hover:text-white transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <motion.div
                    key={pageTitle} 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="hidden sm:block"
                >
                    <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white">
                        {pageTitle}
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-sm text-slate-400 hidden md:block">
                        {pageSubtitle}
                    </motion.p>
                </motion.div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                 <button 
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    aria-label="Open search"
                >
                    <Search className="w-5 h-5" />
                    <span className="hidden lg:flex items-center gap-1 text-xs">
                        Search
                        <kbd className="px-1.5 py-0.5 text-xs font-sans font-semibold text-slate-400 bg-slate-900/80 border border-slate-700 rounded">
                        ⌘K
                        </kbd>
                    </span>
                </button>

                <Button 
                    variant={currentUserAttendanceStatus === 'out' ? 'secondary' : 'primary'}
                    onClick={handleClockToggle}
                    className={`!py-2 !px-3 text-xs ${currentUserAttendanceStatus === 'in' ? '!bg-green-700 hover:!bg-green-600' : ''}`}
                    >
                    <Clock className="w-4 h-4 mr-0 sm:mr-2" />
                    <span className="hidden sm:inline">{currentUserAttendanceStatus === 'out' ? 'Clock In' : 'Clock Out'}</span>
                </Button>

                <button className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="font-semibold text-white">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role || 'Admin'} • {user?.branch || 'Riyadh'}</p>
                    </div>
                    <button onClick={logout} className="ml-2 text-slate-400 hover:text-[#D10028] transition-colors hidden sm:block">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;