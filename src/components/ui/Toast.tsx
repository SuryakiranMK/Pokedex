import React, { useEffect } from 'react'
import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi'
import { soundService } from '../../services/sound'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    // Play sound based on toast type
    if (type === 'success') {
      soundService.play('success')
    } else if (type === 'error') {
      soundService.play('error')
    } else {
      soundService.play('click')
    }

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }))
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// Shortcut helpers
export const toast = {
  success: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'success', dur),
  error: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'error', dur),
  info: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'info', dur),
  warning: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'warning', dur),
}

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts)
  
  return (
    <div className="fixed bottom-5 right-5 z-200 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [toast, removeToast])

  const iconMap = {
    success: <FiCheckCircle className="text-emerald-400 shrink-0" size={18} />,
    error: <FiXCircle className="text-rose-400 shrink-0" size={18} />,
    info: <FiInfo className="text-sky-400 shrink-0" size={18} />,
    warning: <FiAlertTriangle className="text-amber-400 shrink-0" size={18} />,
  }

  const borderColors = {
    success: 'border-emerald-500/30 shadow-emerald-500/5',
    error: 'border-rose-500/30 shadow-rose-500/5',
    info: 'border-sky-500/30 shadow-sky-500/5',
    warning: 'border-amber-500/30 shadow-amber-500/5',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border glass-dark shadow-2xl ${borderColors[toast.type]}`}
    >
      <div className="flex items-center gap-3">
        {iconMap[toast.type]}
        <span className="text-xs font-medium text-slate-200 tracking-wide">{toast.message}</span>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <FiX size={14} />
      </button>
    </motion.div>
  )
}

export default ToastContainer
