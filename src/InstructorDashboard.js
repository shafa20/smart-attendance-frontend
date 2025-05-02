import React, { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import { useAuth } from './contexts/AuthContext'; // <-- Add this
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function InstructorDashboard() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [mostPresentStudent, setMostPresentStudent] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // <-- Use the auth token
  useEffect(() => {
    if (!token) {
      setError('No token found. Please login again.');
      return;
    }
    fetch('http://localhost:8000/api/batches', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load batches');
        return res.json();
      })
      .then(data => setBatches(Array.isArray(data) ? data : Object.values(data)))
      .catch(() => setError('Failed to load batches'));
  }, [token]);

  const handleViewStats = async (batch) => {
    setSelectedBatch(batch);
    setLoadingStats(true);
    setError(null);
    try {
      const [statsRes, studentRes, trendRes] = await Promise.all([
        fetch(`http://localhost:8000/api/batch/${batch.id}/attendance-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`http://localhost:8000/api/batch/${batch.id}/most-present-student`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`http://localhost:8000/api/batch/${batch.id}/attendance-trend`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
      ]);
      setAttendanceStats(statsRes);
      setMostPresentStudent(studentRes);
      setAttendanceTrend(Array.isArray(trendRes) ? trendRes : []);
    } catch (e) {
      setError('Failed to load stats');
      setAttendanceStats(null);
      setMostPresentStudent(null);
      setAttendanceTrend([]);
    }
    setLoadingStats(false);
  };

  const renderStats = () => {
    if (!selectedBatch) return null;
    if (loadingStats) return <div>Loading stats...</div>;
    if (error) return <div style={{color:'red'}}>{error}</div>;
    return (
      <div style={{border:'1px solid #ccc', padding:20, marginTop:20, borderRadius:8, background:'#fafbfc'}}>
        <h3>Stats for: {selectedBatch.name}</h3>
        {attendanceStats && (
          <div>
            <strong>Total Classes:</strong> {attendanceStats.total_classes}<br/>
            <strong>Total Students:</strong> {attendanceStats.total_students}<br/>
            <strong>Total Attendances:</strong> {attendanceStats.total_attendances}
          </div>
        )}
        {mostPresentStudent && mostPresentStudent.student && (
          <div style={{marginTop:10}}>
            <strong>Most Present Student:</strong><br/>
            Name: {mostPresentStudent.student.name}<br/>
            Email: {mostPresentStudent.student.email}<br/>
            Present Count: {mostPresentStudent.present_count}
          </div>
        )}
        {attendanceTrend && attendanceTrend.length > 0 && (
          <div style={{marginTop:20}}>
            <h4>Attendance Trend</h4>
            <Line
              data={{
                labels: attendanceTrend.map(item => item.date),
                datasets: [
                  {
                    label: 'Attendance Count',
                    data: attendanceTrend.map(item => item.count),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Attendance Trend Over Time' }
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DashboardHeader />
      <div className="dashboard-page" style={{padding:20}}>
        <h2>Instructor Dashboard</h2>
        {batches.length === 0 && <div>Loading batches...</div>}
        {error && <div style={{color:'red'}}>{error}</div>}
        <ul style={{listStyle:'none', padding:0}}>
          {batches.map(batch => (
            <li key={batch.id} style={{marginBottom:10, display:'flex', alignItems:'center'}}>
              <span style={{flex:1}}>{batch.name}</span>
              <button onClick={() => handleViewStats(batch)} style={{marginLeft:10}}>
                View stats (chart)
              </button>
            </li>
          ))}
        </ul>
        {renderStats()}
      </div>
      <DashboardFooter />
    </>
  );
}

export default InstructorDashboard;
