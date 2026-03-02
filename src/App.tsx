import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Articles from './pages/Articles';
import ArticleForm from './pages/ArticleForm';
import Sites from './pages/Sites';
import { SiteProvider } from './contexts/SiteContext';

function App() {
  return (
    <SiteProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectForm />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/new" element={<ArticleForm />} />
            <Route path="/articles/:id" element={<ArticleForm />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/settings" element={<div className="p-4"><h1 className="text-2xl font-bold text-slate-900">Paramètres</h1><p className="mt-4 text-slate-500">Paramètres en cours de construction...</p></div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SiteProvider>
  );
}

export default App;
