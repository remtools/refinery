import { useState } from 'react';
import { useEpics } from '../hooks/useEpics';

interface StoryFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  epicId?: string;
}

const StoryForm = ({ onSubmit, initialData, epicId }: StoryFormProps) => {
  const { epics } = useEpics();
  const [formData, setFormData] = useState({
    epic_id: initialData?.epic_id || epicId || '',
    actor: initialData?.actor || '',
    action: initialData?.action || '',
    outcome: initialData?.outcome || '',
    created_by: initialData?.created_by || 'user',
    updated_by: 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.epic_id) {
      newErrors.epic_id = 'Epic is required';
    }
    
    if (!formData.actor.trim()) {
      newErrors.actor = 'Actor is required';
    }
    
    if (!formData.action.trim()) {
      newErrors.action = 'Action is required';
    }
    
    if (!formData.outcome.trim()) {
      newErrors.outcome = 'Outcome is required';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="epic_id" className="block text-sm font-medium text-gray-700 mb-2">
            Parent Epic *
          </label>
          <select
            id="epic_id"
            name="epic_id"
            value={formData.epic_id}
            onChange={handleChange}
            disabled={!!initialData || !!epicId} // Don't allow changing epic after creation
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.epic_id ? 'border-red-500' : 'border-gray-300'
            } ${!!initialData || !!epicId ? 'bg-gray-100' : ''}`}
          >
            <option value="">Select an epic...</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.key} - {epic.title}
              </option>
            ))}
          </select>
          {errors.epic_id && (
            <p className="mt-1 text-sm text-red-600">{errors.epic_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="actor" className="block text-sm font-medium text-gray-700 mb-2">
            Actor *
          </label>
          <input
            type="text"
            id="actor"
            name="actor"
            value={formData.actor}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.actor ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., registered user, admin, system"
          />
          {errors.actor && (
            <p className="mt-1 text-sm text-red-600">{errors.actor}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
          Action *
        </label>
        <input
          type="text"
          id="action"
          name="action"
          value={formData.action}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.action ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., log in to the system, create a new account"
        />
        {errors.action && (
          <p className="mt-1 text-sm text-red-600">{errors.action}</p>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-2">
          Outcome *
        </label>
        <textarea
          id="outcome"
          name="outcome"
          value={formData.outcome}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.outcome ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., I can access my dashboard, my account is created successfully"
        />
        {errors.outcome && (
          <p className="mt-1 text-sm text-red-600">{errors.outcome}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Story' : 'Create Story'}
        </button>
      </div>
    </form>
  );
};

export default StoryForm;