import { useNavigate } from 'react-router-dom';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  onRefetch: () => void;
}

const ProjectList = ({ projects }: ProjectListProps) => {
  const navigate = useNavigate();

  // Helper function to get status color and icon
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          borderColor: 'border-l-green-500',
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'COMPLETED':
        return {
          borderColor: 'border-l-blue-500',
          icon: (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'ON_HOLD':
        return {
          borderColor: 'border-l-yellow-500',
          icon: (
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      default:
        return {
          borderColor: 'border-l-gray-400',
          icon: null,
        };
    }
  };

  if (projects.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600 text-lg">No projects found</p>
        <p className="text-gray-500 text-sm mt-2">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const statusStyle = getStatusStyle(project.status);
        return (
          <div
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
            className={`card cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${statusStyle.borderColor} relative overflow-hidden`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {statusStyle.icon}
                <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
              </div>
              <span className={`badge badge-${project.status.toLowerCase().replace('_', '-')}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {project.description || 'No description'}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tasks</span>
                <span className="font-medium text-gray-900">
                  {project.completedTasks || 0} / {project.taskCount || 0}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.completionRate || 0}%` }}
                ></div>
              </div>

              {project.dueDate && (
                <div className="text-sm text-gray-600 mt-2">
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;
