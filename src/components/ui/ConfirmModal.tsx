"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, SquarePen, X } from "lucide-react";

export type ModalVariant = "delete" | "edit" | "warning" | "info";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    loading?: boolean;
}

const variantConfig: Record<ModalVariant, { icon: typeof Trash2; iconBg: string; iconColor: string; btnBg: string; btnHover: string }> = {
    delete: { icon: Trash2, iconBg: "bg-[#EF4444]/10", iconColor: "text-[#EF4444]", btnBg: "bg-[#EF4444]", btnHover: "hover:bg-[#DC2626]" },
    edit: { icon: SquarePen, iconBg: "bg-[#3B82F6]/10", iconColor: "text-[#3B82F6]", btnBg: "bg-[#3B82F6]", btnHover: "hover:bg-[#2563EB]" },
    warning: { icon: AlertTriangle, iconBg: "bg-[#F97316]/10", iconColor: "text-[#F97316]", btnBg: "bg-[#F97316]", btnHover: "hover:bg-[#EA580C]" },
    info: { icon: AlertTriangle, iconBg: "bg-[#D4AF37]/10", iconColor: "text-[#D4AF37]", btnBg: "bg-[#D4AF37]", btnHover: "hover:bg-[#c4a02f]" },
};

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText = "Cancel",
    variant = "delete",
    loading = false,
}: ConfirmModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const config = variantConfig[variant];
    const Icon = config.icon;

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    if (!open) return null;

    const defaultTitle = variant === "delete" ? "Confirm Deletion" : variant === "edit" ? "Confirm Edit" : "Are you sure?";
    const defaultDesc = variant === "delete"
        ? "This action cannot be undone. Are you sure you want to delete this item?"
        : variant === "edit"
        ? "Are you sure you want to save these changes?"
        : "Are you sure you want to continue?";
    const defaultConfirmText = variant === "delete" ? "Delete" : variant === "edit" ? "Save Changes" : "Confirm";

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div className="bg-card border border-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-5 pb-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                            <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{title || defaultTitle}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-500 hover:text-white transition-all" type="button">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                    <p className="text-sm text-gray-400 leading-relaxed">{description || defaultDesc}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-800 bg-[#111]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg border border-gray-800 transition-all"
                        type="button"
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all active:scale-[0.98] ${config.btnBg} ${config.btnHover} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        type="button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            confirmText || defaultConfirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
