"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface MotionWrapperProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export const MotionWrapper = ({ children, delay = 0, className = "" }: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const PulseWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
