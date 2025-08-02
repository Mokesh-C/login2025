"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'accept' | 'decline' | 'default';
    isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    variant = 'default',
    isLoading = false
}) => {
    // Variant-based styling
    const getVariantStyles = () => {
        switch (variant) {
            case 'accept':
                return {
                    confirmButton: "bg-green-500 hover:bg-green-600 text-white",
                    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
                    iconBg: "bg-green-500/10"
                };
            case 'decline':
                return {
                    confirmButton: "bg-red-500 hover:bg-red-600 text-white",
                    icon: <XCircle className="w-6 h-6 text-red-500" />,
                    iconBg: "bg-red-500/10"
                };
            default:
                return {
                    confirmButton: "bg-blue-500 hover:bg-blue-600 text-white",
                    icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
                    iconBg: "bg-blue-500/10"
                };
        }
    };

    const styles = getVariantStyles();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon */}
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg} mb-4`}>
                            {styles.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {title}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.confirmButton}`}
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationDialog;
