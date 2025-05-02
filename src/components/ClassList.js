import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ClassList.css';
import { useAuth } from '../contexts/AuthContext';

const ClassList = () => {
    const { token } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(!!token);

    useEffect(() => {
        setIsLoggedIn(!!token);
    }, [token]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchUpcomingClasses();
        }
    }, [isLoggedIn]);

    const fetchUpcomingClasses = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/classes/upcoming');
            setClasses(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching classes:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else {
                toast.error('Failed to fetch upcoming classes');
            }
            setLoading(false);
        }
    };

    // Helper: get current time from system
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000 * 30); // update every 30s
        return () => clearInterval(interval);
    }, []);

    // Enhanced markAttendance to accept status
    const markAttendance = async (classId, status = 'present') => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/attendance', {
                class_session_id: classId,
                status
            });
            toast.success(`Attendance marked as ${status}!`);
            fetchUpcomingClasses();
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error('Failed to mark attendance');
        }
    };


    if (!isLoggedIn) {
        return <div>Please login to view classes</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="class-list-container">
            <h2>Upcoming Classes</h2>
            <div className="class-list">
                {classes.map((cls) => {
                    const startTime = new Date(cls.start_time);
                    const endTime = cls.end_time ? new Date(cls.end_time) : null;
                    const nowTime = now;
                    // Attendance window: 10 min before to 10 min after start
                    const attendanceEarly = new Date(startTime.getTime() - 10 * 60 * 1000);
                    const attendanceLate = new Date(startTime.getTime() + 10 * 60 * 1000);
                    let canMarkPresent = nowTime >= attendanceEarly && nowTime <= attendanceLate;
                    let canMarkLate = nowTime > attendanceLate && (!endTime || nowTime < endTime);
                    let isOver = endTime && nowTime >= endTime;
                    let statusNote = '';
                    if (canMarkPresent) {
                        statusNote = 'You can mark attendance now (10 min before to 10 min after class start).';
                    } else if (canMarkLate) {
                        statusNote = 'You are late! Marking attendance now will be recorded as late.';
                    } else if (nowTime < attendanceEarly) {
                        statusNote = 'Attendance can be marked 10 minutes before class starts.';
                    } else if (isOver) {
                        statusNote = 'Class is over. Attendance cannot be marked.';
                    }
                    return (
                        <div key={cls.id} className="class-card">
                            <h3>{cls.batch.name}</h3>
                            <p>Course: {cls.batch.course_name}</p>
                            <p>Room Number: {cls.room_number}</p>
                            <p>Start Time: {startTime.toLocaleString()}</p>
                            <p>End Time: {endTime ? endTime.toLocaleString() : 'N/A'}</p>
                            <p>Current Time: {nowTime.toLocaleString()}</p>
                            <p>Instructor: {cls.instructor.name}</p>
                            <p className="attendance-note">{statusNote}</p>
                            {canMarkPresent && (
                                <button 
                                    onClick={() => markAttendance(cls.id, 'present')}
                                    className="mark-attendance-btn"
                                >
                                    Mark Attendance
                                </button>
                            )}
                            {canMarkLate && (
                                <button 
                                    onClick={() => markAttendance(cls.id, 'late')}
                                    className="mark-attendance-btn late"
                                >
                                    Mark Late Attendance
                                </button>
                            )}
                        </div>
                    );
                })}

              
            </div>
            <ToastContainer />
        </div>
    );
};

export default ClassList;
