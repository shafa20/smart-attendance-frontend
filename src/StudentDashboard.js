import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import ClassList from './components/ClassList';
import './components/StudentDashboard.css';

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <div className="dashboard-content">
        <h1>Student Dashboard</h1>
        <ClassList />
      </div>
      <DashboardFooter />
    </div>
  );
};

export default StudentDashboard;
