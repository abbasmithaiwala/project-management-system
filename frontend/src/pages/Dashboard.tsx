import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PROJECTS } from '../graphql/queries';
import ProjectList from '../components/ProjectList';
import ProjectForm from '../components/ProjectForm';

const Dashboard = () => {
  const { organizationSlug } = useParams<{ organizationSlug: string }>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
    variables: {
      organizationSlug: organizationSlug || 'acme-corp',
      status: filterStatus || undefined,
    },
  });

  if (!organizationSlug) {
    return <div className="p-8">No organization selected</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Project Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Organization: <span className="font-medium">{organizationSlug}</span>
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary"
            >
              {showCreateForm ? 'Cancel' : 'New Project'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Project Form */}
        {showCreateForm && (
          <div className="mb-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
              <ProjectForm
                organizationSlug={organizationSlug}
                onSuccess={() => {
                  setShowCreateForm(false);
                  refetch();
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'ACTIVE'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'COMPLETED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus('ON_HOLD')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'ON_HOLD'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              On Hold
            </button>
          </div>
        </div>

        {/* Project List */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border border-red-200">
            <p className="text-red-800">Error loading projects: {error.message}</p>
          </div>
        )}

        {!loading && !error && (
          <ProjectList
            projects={data?.projects || []}
            onRefetch={refetch}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
