import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TASK, UPDATE_TASK } from '../graphql/mutations';
import { Task, TaskStatus } from '../types';
import Button from './common/Button';
import TaskComments from './TaskComments';

interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  onRefetch: () => void;
}

const TaskBoard = ({ projectId, tasks, onRefetch }: TaskBoardProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeEmail: '',
  });

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        variables: {
          projectId,
          ...newTask,
        },
      });
      setNewTask({ title: '', description: '', assigneeEmail: '' });
      setShowCreateForm(false);
      onRefetch();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask({
        variables: {
          taskId,
          status: newStatus,
        },
      });
      onRefetch();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
          {showCreateForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {showCreateForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="input"
                rows={2}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="label">Assignee Email</label>
              <input
                type="email"
                value={newTask.assigneeEmail}
                onChange={(e) => setNewTask({ ...newTask, assigneeEmail: e.target.value })}
                className="input"
                placeholder="assignee@example.com"
              />
            </div>
            <Button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creating...' : 'Create Task'}
            </Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((status) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              {status.replace('_', ' ')} ({tasksByStatus[status].length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus[status].map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  {task.assigneeEmail && (
                    <p className="text-xs text-gray-500 mt-2">Assigned to: {task.assigneeEmail}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {status !== 'TODO' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(
                            task.id,
                            status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS'
                          );
                        }}
                        className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        ← Move Back
                      </button>
                    )}
                    {status !== 'DONE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(
                            task.id,
                            status === 'TODO' ? 'IN_PROGRESS' : 'DONE'
                          );
                        }}
                        className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Move Forward →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">{selectedTask.description}</p>
              <div className="space-y-2 mb-6">
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`badge badge-${selectedTask.status.toLowerCase().replace('_', '-')}`}>
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </p>
                {selectedTask.assigneeEmail && (
                  <p className="text-sm">
                    <span className="font-medium">Assignee:</span> {selectedTask.assigneeEmail}
                  </p>
                )}
              </div>
              <TaskComments taskId={selectedTask.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
