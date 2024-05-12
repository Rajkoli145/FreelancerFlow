import React from 'react';

export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
}) {
  const currentLength = value?.length || 0;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2.5
          bg-white border rounded-lg
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          resize-none
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
        `}
      />

      <div className="flex items-center justify-between mt-1.5">
        <div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
        
        {maxLength && (
          <p className="text-sm text-gray-500">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
