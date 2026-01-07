import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PROJECT } from '../graphql/queries';
import TaskBoard from '../components/TaskBoard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/ProjectForm';
import NotFound from './NotFound';
import { isNotFoundError } from '../utils/errorUtils';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Handle project not found error
  if (error && isNotFoundError(error)) {
    return (
      <NotFound
        title="Project Not Found"
        message="The project you are looking for does not exist. It may have been deleted or you may not have access to it."
        backPath="/"
      />
    );
  }

  // Handle other errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-800">Error loading project: {error.message}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const project = data?.project;

  // Defensive check
  if (!project) {
    return (
      <NotFound
        title="Project Not Found"
        message="The project you are looking for does not exist."
        backPath="/"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center text-sm sm:text-base"
              >
                ← Back to Projects
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{project.name}</h1>
              {project.description && (
                <p className="mt-1 text-sm text-gray-600 break-words">{project.description}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
                <span className={`badge badge-${project.status.toLowerCase().replace('_', '-')}`}>
                  {project.status.replace('_', ' ')}
                </span>
                {project.dueDate && (
                  <span className="text-xs sm:text-sm text-gray-600">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-4 lg:text-right">
                <div className="text-sm text-gray-600 mb-1">Progress</div>
                <div className="text-2xl font-bold text-gray-900">
                  {project.completedTasks || 0} / {project.taskCount || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {project.completionRate?.toFixed(0) || 0}% Complete
                </div>
              </div>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary w-full whitespace-nowrap"
              >
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskBoard
          projectId={projectId!}
          tasks={project.tasks || []}
          onRefetch={refetch}
        />
      </main>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        <ProjectForm
          organizationSlug={project.organization.slug}
          project={project}
          onSuccess={() => {
            setIsEditModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;
