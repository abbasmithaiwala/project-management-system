import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/acme-corp" replace />} />
          <Route path="/dashboard/:organizationSlug" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
