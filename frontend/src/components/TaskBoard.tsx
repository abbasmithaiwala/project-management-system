import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CREATE_TASK, UPDATE_TASK } from '../graphql/mutations';
import { Task, TaskStatus } from '../types';
import Button from './common/Button';
import TaskComments from './TaskComments';

interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  onRefetch: () => void;
}

interface DraggableTaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onClick: () => void;
}

const DraggableTaskCard = ({ task, onStatusChange, onClick }: DraggableTaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div onClick={onClick} className="cursor-pointer">
        <h4 className="font-medium text-gray-900 text-sm md:text-base break-words">{task.title}</h4>
        {task.description && (
          <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
        )}
        {task.assigneeEmail && (
          <p className="text-xs text-gray-500 mt-2 truncate" title={task.assigneeEmail}>
            Assigned to: {task.assigneeEmail}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {task.status !== 'TODO' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(
                task.id,
                task.status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS'
              );
            }}
            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap"
          >
            <span className="hidden sm:inline">← Move Back</span>
            <span className="sm:hidden">← Back</span>
          </button>
        )}
        {task.status !== 'DONE' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(
                task.id,
                task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE'
              );
            }}
            className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Move Forward →</span>
            <span className="sm:hidden">Next →</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface DroppableColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const DroppableColumn = ({ status, tasks, onStatusChange, onTaskClick }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-lg p-3 md:p-4 transition-colors ${
        isOver ? 'bg-primary-100 ring-2 ring-primary-500' : ''
      }`}
    >
      <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
        {status.replace('_', ' ')} ({tasks.length})
      </h3>
      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
};

const TaskBoard = ({ projectId, tasks, onRefetch }: TaskBoardProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeEmail: '',
  });

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start dragging
      },
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    await handleStatusChange(taskId, newStatus);
  };

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tasks</h2>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary w-full sm:w-auto">
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
              <Button type="submit" disabled={creating} className="btn-primary w-full sm:w-auto">
                {creating ? 'Creating...' : 'Create Task'}
              </Button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onStatusChange={handleStatusChange}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        {/* Drag Overlay - shows the task being dragged */}
        <DragOverlay>
          {activeTask ? (
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg cursor-grabbing opacity-90">
              <h4 className="font-medium text-gray-900 text-sm md:text-base break-words">{activeTask.title}</h4>
              {activeTask.description && (
                <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{activeTask.description}</p>
              )}
              {activeTask.assigneeEmail && (
                <p className="text-xs text-gray-500 mt-2 truncate">
                  Assigned to: {activeTask.assigneeEmail}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>

        {/* Task Detail Modal */}
        {selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words flex-1">{selectedTask.title}</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
              {selectedTask.description && (
                <p className="text-sm sm:text-base text-gray-600 mb-4 break-words">{selectedTask.description}</p>
              )}
              <div className="space-y-2 mb-6">
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`badge badge-${selectedTask.status.toLowerCase().replace('_', '-')}`}>
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </p>
                {selectedTask.assigneeEmail && (
                  <p className="text-sm break-words">
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
    </DndContext>
  );
};

export default TaskBoard;
