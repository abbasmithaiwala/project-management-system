import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT, UPDATE_PROJECT } from '../graphql/mutations';
import Button from './common/Button';
import { Project } from '../types';

interface ProjectFormProps {
  organizationSlug: string;
  onSuccess: () => void;
  onCancel: () => void;
  project?: Project | null; // Optional project for edit mode
}

const ProjectForm = ({ organizationSlug, onSuccess, onCancel, project }: ProjectFormProps) => {
  const isEditMode = !!project;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    dueDate: '',
  });

  // Initialize form with project data in edit mode
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        dueDate: project.dueDate || '',
      });
    }
  }, [project]);

  const [createProject, { loading: createLoading, error: createError }] = useMutation(CREATE_PROJECT);
  const [updateProject, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_PROJECT);

  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateProject({
          variables: {
            projectId: project.id,
            ...formData,
            dueDate: formData.dueDate || undefined,
          },
        });
      } else {
        await createProject({
          variables: {
            organizationSlug,
            ...formData,
            dueDate: formData.dueDate || undefined,
          },
        });
      }
      onSuccess();
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} project:`, err);
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
          {loading
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
            ? 'Update Project'
            : 'Create Project'}
        </Button>
        <Button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
