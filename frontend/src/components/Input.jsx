import React, { useState } from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';

const Input = ({ label, icon: Icon, error, valid, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1.5 text-slate-400">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          type={inputType}
          {...props}
          className={`w-full bg-slate-900/50 border rounded-xl py-2.5 transition-all outline-none 
            ${Icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-red-500 pr-16' : valid ? 'border-green-500 pr-16' : 'border-white/10 focus:border-primary-500 pr-4'}
            ${type === 'date' ? '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 group-focus-within:[&::-webkit-calendar-picker-indicator]:opacity-100 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:transition-opacity' : ''}
          `}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isPassword && (
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white transition-colors">
               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
          )}
          {valid && type !== 'date' && <Check size={18} className="text-green-500" />}
          {error && type !== 'date' && <X size={18} className="text-red-500" />}
        </div>
      </div>
      {error && typeof error === 'string' && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
