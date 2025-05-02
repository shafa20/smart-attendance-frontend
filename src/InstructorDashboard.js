import React, { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import { useAuth } from './contexts/AuthContext'; // <-- Add this
import { Line } from 'react-chartjs-2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    start_time: '',
    duration: ''
  });
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
  const openModal = (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
    setFormData({
      topic: '',
      start_time: '',
      duration: ''
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBatch(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token || !selectedBatch) return;

    const payload = {
      batch_id: selectedBatch.id,
      topic: formData.topic,
      start_time: formData.start_time,
      duration: parseInt(formData.duration)
    };

    fetch('http://127.0.0.1:8000/api/classes/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          toast.success("Class scheduled successfully!");
          closeModal();
        } else {
          toast.error(data.message || 'Failed to schedule class');
        }
      })
      .catch(() => toast.error("An error occurred while scheduling the class."));
  };
  const renderStats = () => {
    if (!selectedBatch) return null;
    if (loadingStats) return <div>Loading stats...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
  
    return (
      <div style={{
        border: '1px solid #ddd',
        padding: 20,
        marginTop: 30,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        fontSize: '14px',
        lineHeight: '1.6',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: 10, color: '#2c3e50' }}>
          Stats for: {selectedBatch.name}
        </h3>
  
        {attendanceStats && (
          <div style={{ backgroundColor: '#eafaf1', padding: 10, borderRadius: 6, marginBottom: 10 }}>
            <strong>Total Classes:</strong> {attendanceStats.total_classes} <br />
            <strong>Total Students:</strong> {attendanceStats.total_students} <br />
            <strong>Total Attendances:</strong> {attendanceStats.total_attendances}
          </div>
        )}
  
        {mostPresentStudent && mostPresentStudent.student && (
          <div style={{ backgroundColor: '#fff4e6', padding: 10, borderRadius: 6, marginBottom: 10 }}>
            <strong>Most Present Student:</strong><br />
            <span style={{ color: '#d35400' }}>Name:</span> {mostPresentStudent.student.name} <br />
            <span style={{ color: '#d35400' }}>Email:</span> {mostPresentStudent.student.email} <br />
            <span style={{ color: '#d35400' }}>Present Count:</span> {mostPresentStudent.present_count}
          </div>
        )}
  
        {attendanceTrend && attendanceTrend.length > 0 && (
          <div style={{ marginTop: 20, backgroundColor: '#e8f4fc', padding: 10, borderRadius: 6 }}>
            <h4 style={{ marginBottom: 10, color: '#2980b9' }}>Attendance Trend</h4>
            <Line
              data={{
                labels: attendanceTrend.map(item => item.date),
                datasets: [{
                  label: 'Attendance Count',
                  data: attendanceTrend.map(item => item.count),
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }]
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
      <ToastContainer />
      <div className="dashboard-page" style={{ padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontWeight: 700,
            color: '#4f46e5',
            fontSize: '2.5rem'
          }}>Instructor Dashboard</h2>
        </div>
  
        {batches.length === 0 && <div>Loading batches...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
  
        <div style={{ marginBottom: 30 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {batches.map(batch => (
              <li key={batch.id} style={{
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                background: '#f5f5f5',
                padding: 10,
                borderRadius: 6
              }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{batch.name}</span>
                <button
                  onClick={() => handleViewStats(batch)}
                  style={btnStyle('#3498db')}
                >
                  View Stats
                </button>
                <button
                  onClick={() => openModal(batch)}
                  style={btnStyle('#2ecc71')}
                >
                  Create Schedule
                </button>
              </li>
            ))}
          </ul>
        </div>
  
        {/* Modal */}
        {showModal && (
  <div style={modalOverlay}>
    <div style={modalBox}>
      <h2 style={{ marginBottom: 20, color: '#333' }}>Create Schedule</h2>
      <p style={{ marginBottom: 25, fontWeight: 500 }}>
        For Batch: <span style={{ color: '#4f46e5' }}>{selectedBatch?.name}</span>
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formGroup}>
          <label style={labelStyle}>Topic</label>
          <input
            type="text"
            value={formData.topic}
            required
            placeholder="please enter topic"
            onChange={e => setFormData({ ...formData, topic: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={formGroup}>
          <label style={labelStyle}>Start Time</label>
          <input
            type="datetime-local"
            value={formData.start_time}
            required
            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={formGroup}>
          <label style={labelStyle}>Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={formData.duration}
            required
            placeholder="e.g. 60"
            onChange={e => setFormData({ ...formData, duration: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 30 }}>
          <button type="submit" style={btnStyle('#4f46e5')}>Submit</button>
          <button type="button" style={btnStyle('#e74c3c')} onClick={closeModal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}

  
       
        {renderStats()}
      </div>
      <DashboardFooter />
    </>
  );
  }
  
  // Reusable styles
  const btnStyle = (bg) => ({
  marginLeft: 10,
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 4,
  cursor: 'pointer'
  });
  
  const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalBox = {
  backgroundColor: 'white',
  padding: '30px 25px',
  borderRadius: 10,
  width: '90%',
  maxWidth: 500,
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
};

const formGroup = {
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'column'
};

const labelStyle = {
  fontWeight: 'bold',
  marginBottom: 6,
  color: '#333'
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 5,
  border: '1px solid #ccc',
  fontSize: 14
};



  

export default InstructorDashboard;


