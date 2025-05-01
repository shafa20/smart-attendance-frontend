import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';

function StudentDashboard() {
  return (
    <>
      <DashboardHeader />
      <div className="dashboard-page">Welcome to Student Dashboard</div>
      <DashboardFooter />
    </>
  );
}

export default StudentDashboard;
