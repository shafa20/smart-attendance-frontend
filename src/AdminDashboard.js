import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';

function AdminDashboard() {
  return (
    <>
      <DashboardHeader />
      <div className="dashboard-page">Welcome to Admin Dashboard</div>
      <DashboardFooter />
    </>
  );
}

export default AdminDashboard;
