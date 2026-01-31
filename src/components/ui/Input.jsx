import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, type = 'text', className = '', containerClassName = '', 
  required = true, helperText, leftIcon: LeftIcon, rightIcon: RightIcon, 
  onRightIconClick, disabled = false, onEnter, ...props
}, ref) => {
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
  };

  return (
    <div className={`${containerClassName} ${disabled && 'opacity-60'}`}>
      {label && (
        <label className="block text-[14px] font-semibold text-slate-700 mb-1 ml-1">
          {label} {!required && <span className="text-slate-400 font-normal">(optional)</span>}
        </label>
      )}
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <LeftIcon size={18} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          onKeyDown={handleKeyDown}
          className={`
            w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl
            text-slate-900 placeholder-slate-400 font-medium
            focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600
            transition-all duration-200
            disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-11' : ''}
            ${RightIcon ? 'pr-11' : ''}
            ${error ? 'border-red-500 focus:ring-red-50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RightIcon size={18} />
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-500 font-bold ml-1 mt-1 animate-in fade-in slide-in-from-left-1">{error}</p>
      ) : helperText && (
        <p className="text-xs text-slate-500 ml-1 mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;