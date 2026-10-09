// Reusable UI components with friendly color palette

import { ReactNode } from 'react';

// Card component
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Card with header
export function CardWithHeader({ 
  title, 
  icon, 
  gradient = 'from-indigo-500 to-purple-500',
  children 
}: { 
  title: string; 
  icon?: string; 
  gradient?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-sm`}>
            {icon}
          </div>
        )}
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

// Button component
export function Button({ 
  children, 
  variant = 'primary',
  onClick,
  disabled = false,
  className = ''
}: { 
  children: ReactNode; 
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md shadow-indigo-200',
    secondary: 'bg-white border border-slate-300 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 shadow-sm',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-200',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-200',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md shadow-red-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// Stat card
export function StatCard({ 
  label, 
  value, 
  icon, 
  gradient = 'from-indigo-400 to-purple-500',
  subtitle 
}: { 
  label: string; 
  value: string | number; 
  icon?: string; 
  gradient?: string;
  subtitle?: string;
}) {
  return (
    <Card className="p-5 card-hover">
      {icon && (
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-3 shadow-sm`}>
          {icon}
        </div>
      )}
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </Card>
  );
}

// Badge component
export function Badge({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Section title
export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && <p className="text-slate-600 text-sm mt-2">{subtitle}</p>}
    </div>
  );
}

// Info box
export function InfoBox({ 
  children, 
  variant = 'info',
  title 
}: { 
  children: ReactNode; 
  variant?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
}) {
  const variants = {
    info: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    danger: '❌',
  };

  return (
    <div className={`border rounded-2xl p-5 ${variants[variant]}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icons[variant]}</span>
          <h4 className="font-bold">{title}</h4>
        </div>
      )}
      <div className="text-sm space-y-1">{children}</div>
    </div>
  );
}

// Metric display
export function MetricDisplay({ 
  label, 
  value, 
  color = 'slate' 
}: { 
  label: string; 
  value: string | number; 
  color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'purple' | 'red';
}) {
  const colors = {
    slate: 'text-slate-800',
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
      <div className={`text-lg font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
