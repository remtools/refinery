import { useState } from 'react';
import { useStories } from '../hooks/useStories';

interface AcceptanceCriterionFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  storyId?: string;
}

const AcceptanceCriterionForm = ({ 
  onSubmit, 
  initialData, 
  storyId 
}: AcceptanceCriterionFormProps) => {
  const { stories } = useStories();
  const [formData, setFormData] = useState({
    story_id: initialData?.story_id || storyId || '',
    given: initialData?.given || '',
    when: initialData?.when || '',
    then: initialData?.then || '',
    risk: initialData?.risk || 'Medium',
    valid: initialData?.valid ?? true,
    comments: initialData?.comments || '',
    created_by: initialData?.created_by || 'user',
    updated_by: 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.story_id) {
      newErrors.story_id = 'Story is required';
    }
    
    if (!formData.given.trim()) {
      newErrors.given = 'Given condition is required';
    }
    
    if (!formData.when.trim()) {
      newErrors.when = 'When condition is required';
    }
    
    if (!formData.then.trim()) {
      newErrors.then = 'Then condition is required';
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
    const { name, value, type } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="story_id" className="block text-sm font-medium text-gray-700 mb-2">
            Parent Story *
          </label>
          <select
            id="story_id"
            name="story_id"
            value={formData.story_id}
            onChange={handleChange}
            disabled={!!initialData || !!storyId}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.story_id ? 'border-red-500' : 'border-gray-300'
            } ${!!initialData || !!storyId ? 'bg-gray-100' : ''}`}
          >
            <option value="">Select a story...</option>
            {stories.map((story) => (
              <option key={story.id} value={story.id}>
                {story.actor} - {story.action}
              </option>
            ))}
          </select>
          {errors.story_id && (
            <p className="mt-1 text-sm text-red-600">{errors.story_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="risk" className="block text-sm font-medium text-gray-700 mb-2">
            Risk Level *
          </label>
          <select
            id="risk"
            name="risk"
            value={formData.risk}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.risk ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.risk && (
            <p className="mt-1 text-sm text-red-600">{errors.risk}</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="given" className="block text-sm font-medium text-gray-700 mb-2">
            Given *
          </label>
          <textarea
            id="given"
            name="given"
            value={formData.given}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.given ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="The initial context or precondition"
          />
          {errors.given && (
            <p className="mt-1 text-sm text-red-600">{errors.given}</p>
          )}
        </div>

        <div>
          <label htmlFor="when" className="block text-sm font-medium text-gray-700 mb-2">
            When *
          </label>
          <textarea
            id="when"
            name="when"
            value={formData.when}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.when ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="The action or event that occurs"
          />
          {errors.when && (
            <p className="mt-1 text-sm text-red-600">{errors.when}</p>
          )}
        </div>

        <div>
          <label htmlFor="then" className="block text-sm font-medium text-gray-700 mb-2">
            Then *
          </label>
          <textarea
            id="then"
            name="then"
            value={formData.then}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.then ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="The expected outcome or result"
          />
          {errors.then && (
            <p className="mt-1 text-sm text-red-600">{errors.then}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
          Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          placeholder="Additional notes or comments"
        />
      </div>

      <div className="mt-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="valid"
            checked={formData.valid}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Valid</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Acceptance Criterion' : 'Create Acceptance Criterion'}
        </button>
      </div>
    </form>
  );
};

export default AcceptanceCriterionForm;