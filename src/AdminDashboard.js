import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';

import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';

function AdminDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportingBatchId, setExportingBatchId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }
    fetch('http://localhost:8000/api/batches', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch batches');
        return res.json();
      })
      .then(data => {
        setBatches(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // Batch-wise export handler
  const handleBatchExport = async (batchId) => {
    setExportingBatchId(batchId);
    try {
      const response = await fetch(`http://localhost:8000/api/batches/export-attendance/${batchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to export attendance');
      const blob = await response.blob();
      let filename = `attendance_export_batch_${batchId}.csv`;
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const match = disposition.match(/filename=([^;]+)/);
        if (match && match[1]) filename = match[1].replace(/"/g, '');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting batch attendance: ' + err.message);
    }
    setExportingBatchId(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('http://localhost:8000/api/batches/export-attendance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      // Guess filename from Content-Disposition or fallback
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'attendance_export.csv';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export attendance data: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="dashboard-page" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f0f5ff 50%, #c7d2fe 100%)', padding: '2rem 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(60,72,88,0.10)', padding: '2.5rem 2.5rem 2rem 2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontWeight: 700, color: '#4f46e5', fontSize: '2.5rem', letterSpacing: '-1px' }}>Admin Dashboard</h2>
            <div style={{ color: '#64748b', fontSize: '1.15rem', marginTop: 4, marginBottom: 18, fontWeight: 500 }}>Test All Batches</div>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.7rem 2.2rem',
                fontSize: '1.1rem',
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.7 : 1,
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                transition: 'background 0.2s, box-shadow 0.2s'
              }}
            >
              {exporting ? 'Exporting...' : 'Export Attendance Data'}
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#6366f1', fontWeight: 500 }}>Loading batches...</div>
          ) : error ? (
            <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.8rem 1.2rem', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>Error: {error}</div>
          ) : batches.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontWeight: 500 }}>No batches found.</div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 1px 4px rgba(60,72,88,0.07)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f8fafc', borderRadius: 12, overflow: 'hidden', fontSize: '0.98rem', border: '1px solid #e0e7ef' }}>
  <thead style={{ background: '#6366f1' }}>
    <tr>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>ID</th>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>Name</th>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>Course</th>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>Start Date</th>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>End Date</th>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>Status</th>
      <th style={{ color: '#fff', padding: '0.6rem', fontWeight: 700, letterSpacing: '0.02em', fontSize: '1rem', border: 'none' }}>Action</th>
    </tr>
  </thead>
  <tbody>
    {batches.map(batch => (
      <tr key={batch.id} style={{ background: '#fff', borderBottom: '1px solid #e0e7ef', transition: 'background 0.18s' }}>
        <td style={{ padding: '0.48rem', textAlign: 'center', fontWeight: 500 }}>{batch.id}</td>
        <td style={{ padding: '0.48rem', textAlign: 'center' }}>{batch.name}</td>
        <td style={{ padding: '0.48rem', textAlign: 'center' }}>{batch.course_name}</td>
        <td style={{ padding: '0.48rem', textAlign: 'center' }}>{batch.start_date ? batch.start_date.slice(0, 10) : ''}</td>
        <td style={{ padding: '0.48rem', textAlign: 'center' }}>{batch.end_date ? batch.end_date.slice(0, 10) : ''}</td>
        <td style={{ padding: '0.48rem', textAlign: 'center', color: batch.status === 'completed' ? '#22c55e' : '#f59e42', fontWeight: 600 }}>{batch.status}</td>
        <td style={{ padding: '0.48rem', textAlign: 'center' }}>
          <button
            onClick={() => handleBatchExport(batch.id)}
            disabled={exportingBatchId === batch.id}
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              borderRadius: '0.4rem',
              padding: '0.38rem 1.2rem',
              fontSize: '0.96rem',
              cursor: exportingBatchId === batch.id ? 'not-allowed' : 'pointer',
              opacity: exportingBatchId === batch.id ? 0.7 : 1,
              boxShadow: '0 1px 4px rgba(99,102,241,0.09)',
              transition: 'background 0.2s, box-shadow 0.2s'
            }}
          >
            {exportingBatchId === batch.id ? 'Exporting...' : 'Export Attendance'}
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
            </div>
          )}
        </div>
      </div>
      <DashboardFooter />
    </>
  );
}

export default AdminDashboard;
