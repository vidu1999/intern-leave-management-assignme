import { Route, Routes } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import LeaveRequestsPage from './pages/LeaveRequestsPage.jsx';
import NewLeaveRequestPage from './pages/NewLeaveRequestPage.jsx';
import ManageLeavesPage from './pages/ManageLeavesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/leaves" element={<LeaveRequestsPage />} />
        <Route path="/leaves/new" element={<NewLeaveRequestPage />} />
        <Route path="/admin/leaves" element={<ManageLeavesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
