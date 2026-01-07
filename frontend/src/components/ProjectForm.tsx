import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT } from '../graphql/mutations';
import Button from './common/Button';

interface ProjectFormProps {
  organizationSlug: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm = ({ organizationSlug, onSuccess, onCancel }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    dueDate: '',
  });

  const [createProject, { loading, error }] = useMutation(CREATE_PROJECT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProject({
        variables: {
          organizationSlug,
          ...formData,
          dueDate: formData.dueDate || undefined,
        },
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="Enter project name"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows={3}
          placeholder="Enter project description"
        />
      </div>

      <div>
        <label htmlFor="status" className="label">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="input"
        >
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="label">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="input"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">Error: {error.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
        <Button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
