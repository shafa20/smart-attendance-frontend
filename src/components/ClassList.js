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

    const markAttendance = async (classId) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/attendance', {
                class_session_id: classId,
                status: 'present'
            });
            
            toast.success('Attendance marked successfully!');
            // Refresh the classes list
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
                {classes.map((cls) => (
                    <div key={cls.id} className="class-card">
                        <h3>{cls.batch.name}</h3>
                        <p>Course: {cls.batch.course_name}</p>
                        <p>Room Number: {cls.room_number}</p>
                        <p>Start Time: {new Date(cls.start_time).toLocaleString()}</p>
                        <p>Instructor: {cls.instructor.name}</p>
                        <button 
                            onClick={() => markAttendance(cls.id)}
                            className="mark-attendance-btn"
                        >
                            Mark Attendance
                        </button>
                    </div>
                ))}
            </div>
            <ToastContainer />
        </div>
    );
};

export default ClassList;
