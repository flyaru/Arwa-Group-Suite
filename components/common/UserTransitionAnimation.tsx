
import React from 'react';
import { motion } from 'framer-motion';

interface UserTransitionAnimationProps {
    type: 'login' | 'logout';
    userName: string;
}

const UserTransitionAnimation: React.FC<UserTransitionAnimationProps> = ({ type, userName }) => {
    const message = type === 'login' ? `Welcome, ${userName}!` : `Goodbye, ${userName}!`;
    const letters = Array.from(message);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06,
                delayChildren: 0.2,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.04,
                staggerDirection: -1,
            },
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
            },
        },
        exit: {
            opacity: 0,
            y: -50,
        }
    };

    return (
        <motion.div
            className="absolute inset-0 bg-[#0B2D48]/80 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1
                className="text-4xl md:text-6xl font-bold text-white text-center overflow-hidden flex"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {letters.map((letter, index) => (
                    <motion.span key={index} variants={letterVariants} style={{ whiteSpace: 'pre' }}>
                        {letter}
                    </motion.span>
                ))}
            </motion.h1>
        </motion.div>
    );
};

export default UserTransitionAnimation;
