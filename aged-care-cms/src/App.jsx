import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import ResidentDetail from './pages/ResidentDetail';
import Medications from './pages/Medications';
import ClinicalNotes from './pages/ClinicalNotes';
import Appointments from './pages/Appointments';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="residents" element={<Residents />} />
          <Route path="residents/:id" element={<ResidentDetail />} />
          <Route path="medications" element={<Medications />} />
          <Route path="notes" element={<ClinicalNotes />} />
          <Route path="appointments" element={<Appointments />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
