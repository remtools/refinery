import { useState } from 'react';

interface ModernFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  title: string;
  submitButtonText: string;
  onCancel?: () => void;
}

const ModernForm = ({ onSubmit, initialData, title, submitButtonText, onCancel }: ModernFormProps) => {
  const [formData, setFormData] = useState({
    key: initialData?.key || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    created_by: initialData?.created_by || 'user',
    updated_by: 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.key.trim()) {
      newErrors.key = 'Epic key is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only uppercase letters, numbers, and hyphens';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Field */}
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
              Epic Key
              <span className="text-error-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.key ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white'
                } ${initialData ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-primary-400'}`}
                placeholder="e.g., EPIC-001"
                disabled={!!initialData}
              />
              {errors.key && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            {errors.key && (
              <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3L13.932 4c-.77-1.333-2.694-1.333-4.632 1L4.667 17c-.77 1.333.192 3 1.932 3z" />
                </svg>
                {errors.key}
              </p>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
              <span className="text-error-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.title ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white hover:border-primary-400'
                }`}
                placeholder="Enter epic title"
              />
              {errors.title && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            {errors.title && (
              <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3L13.932 4c-.77-1.333-2.694-1.333-4.632 1L4.667 17c-.77 1.333.192 3 1.932 3z" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <span className="text-error-500 ml-1">*</span>
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
                errors.description ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white hover:border-primary-400'
              }`}
              placeholder="Provide a detailed description of the epic..."
            />
            {errors.description && (
              <div className="absolute top-3 right-3">
                <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.description && (
            <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3L13.932 4c-.77-1.333-2.694-1.333-4.632 1L4.667 17c-.77 1.333.192 3 1.932 3z" />
              </svg>
              {errors.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-button-hover transition-all duration-200 font-medium shadow-button"
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModernForm;