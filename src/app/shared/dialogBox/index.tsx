"use client";

import { Loader } from "lucide-react";
import React from "react";

interface DialogProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  isPending?: boolean;
}

export default function Dialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onClose,
  onConfirm,
  showCancel = true,
  isPending = false
}: DialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-600 ml-2 hover:bg-blue-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">{children}</div>

        <div className="flex gap-2 justify-end">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-blue-300 cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
            }}
            disabled={isPending}
            className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            {isPending ? <Loader /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
