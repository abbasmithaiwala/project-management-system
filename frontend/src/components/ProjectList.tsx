import { useNavigate } from 'react-router-dom';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  onRefetch: () => void;
}

const ProjectList = ({ projects }: ProjectListProps) => {
  const navigate = useNavigate();

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
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/project/${project.id}`)}
          className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
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
      ))}
    </div>
  );
};

export default ProjectList;
