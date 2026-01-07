import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PROJECT } from '../graphql/queries';
import TaskBoard from '../components/TaskBoard';
import Button from '../components/common/Button';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <p className="text-gray-800">Project not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center"
              >
                ← Back to Projects
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-1 text-sm text-gray-600">{project.description}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className={`badge badge-${project.status.toLowerCase().replace('_', '-')}`}>
                  {project.status.replace('_', ' ')}
                </span>
                {project.dueDate && (
                  <span className="text-sm text-gray-600">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.completedTasks || 0} / {project.taskCount || 0}
              </div>
              <div className="text-sm text-gray-600">
                {project.completionRate?.toFixed(0) || 0}% Complete
              </div>
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
    </div>
  );
};

export default ProjectDetail;
