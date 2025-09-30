"use client"

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

interface CustomToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export function CustomToast({ message, type, onClose }: CustomToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
  }

  const Icon = icons[type]
  const colorScheme = colors[type]

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-md w-full",
      "bg-card text-card-foreground",
      "animate-in slide-in-from-right-full duration-300",
      colorScheme.bg
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        colorScheme.iconBg
      )}>
        <Icon className={cn("w-4 h-4", colorScheme.icon)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium leading-5", colorScheme.text)}>
          {message}
        </p>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
            "hover:bg-black/5 transition-colors",
            colorScheme.text
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Custom toast functions that match your design
export const customToast = {
  success: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        message={message}
        type="success"
        onClose={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'top-right',
    })
  },

  error: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        message={message}
        type="error"
        onClose={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 6000,
      position: 'top-right',
    })
  },

  warning: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        message={message}
        type="warning"
        onClose={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 5000,
      position: 'top-right',
    })
  },

  info: (message: string) => {
    toast.custom((t) => (
      <CustomToast
        message={message}
        type="info"
        onClose={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'top-right',
    })
  },

  loading: (message: string) => {
    return toast.custom((t) => (
      <div className="flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-md w-full bg-card text-card-foreground animate-in slide-in-from-right-full duration-300">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5 text-blue-800">
            {message}
          </p>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-right',
    })
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: (data) => {
        const message = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        return message;
      },
      error: (error) => {
        const message = typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error;
        return message;
      },
    }, {
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
      },
      success: {
        duration: 4000,
      },
      error: {
        duration: 6000,
      },
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
}
