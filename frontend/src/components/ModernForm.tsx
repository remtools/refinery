import { useState } from 'react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'uuid';
  required?: boolean;
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  disabled?: boolean;
}

interface ModernFormProps {
  onSubmit: (data: any, keepOpen?: boolean) => void;
  initialData?: any;
  title: string;
  submitButtonText: string;
  onCancel?: () => void;
  fields?: FormField[];
  className?: string;
  hideCancel?: boolean;
}

const ModernForm = ({ onSubmit, initialData, title, submitButtonText, onCancel, fields, className = '', hideCancel = false }: ModernFormProps) => {
  // Default fields for Epics (backward compatibility)
  const defaultFields: FormField[] = [
    // Key is auto-generated
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter epic title' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Provide a detailed description...' }
  ];

  const activeFields = fields || defaultFields;

  const getInitialState = () => {
    const state: any = {
      created_by: initialData?.created_by || 'user',
      updated_by: 'user',
    };
    activeFields.forEach(field => {
      state[field.name] = initialData?.[field.name] || '';
    });
    return state;
  };

  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keepOpen, setKeepOpen] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    activeFields.forEach(field => {
      if (field.required && !String(formData[field.name] || '').trim()) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.name === 'key' && formData.key && !/^[A-Z0-9-]+$/.test(formData.key)) {
        newErrors.key = 'Key must contain only uppercase letters, numbers, and hyphens';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      onSubmit(formData, keepOpen);
      if (keepOpen) {
        // Reset form but keep 'created_by' and other hidden fields if needed
        // For now, simpler to just reset user-editable fields
        const resetState: any = {
          created_by: 'user',
          updated_by: 'user',
        };
        activeFields.forEach(field => {
          // Keep the key if it's disabled (editing mode), but wait, create another implies new item.
          // If we are editing, 'keepOpen' doesn't make much sense or should act differently.
          // Assuming this is mostly for creation.
          // If existing data was passed (edit mode), we probably shouldn't allow 'create another' easily unless intended.
          // But let's support it for creation flow.
          resetState[field.name] = ''; // Clear all fields
        });
        setFormData(resetState);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderField = (field: FormField, index: number) => {
    const commonClass = `w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors[field.name] ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white hover:border-primary-400'
      } ${field.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`;

    return (
      <div key={field.name} className={field.type === 'textarea' ? 'col-span-full' : ''}>
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-error-500 ml-1">*</span>}
        </label>

        <div className="relative">
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              rows={3}
              className={commonClass + ' resize-none'}
              placeholder={field.placeholder}
              disabled={field.disabled}
              autoFocus={index === 0}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className={commonClass}
              disabled={field.disabled}
              autoFocus={index === 0}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(opt => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const label = typeof opt === 'string' ? opt : opt.label;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          ) : (
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className={commonClass}
              placeholder={field.placeholder}
              disabled={field.disabled}
              autoFocus={index === 0}
            />
          )}

          {errors[field.name] && (
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {errors[field.name] && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-card border border-gray-200 animate-fade-in ${className}`} onKeyDown={handleKeyDown}>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {onCancel && !hideCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeFields.map((field, index) => renderField(field, index))}
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">

          {!initialData && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={keepOpen}
                  onChange={(e) => setKeepOpen(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-primary-500 checked:bg-primary-500 hover:border-primary-400"
                />
                <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors select-none">Create another</span>
            </label>
          )}
          {initialData && <div></div>} {/* Spacer if not creating */}

          <div className="flex gap-3">
            {onCancel && !hideCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                title="Esc"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-button-hover transition-all duration-200 font-medium shadow-button flex items-center gap-2"
              title="Ctrl + Enter"
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModernForm;