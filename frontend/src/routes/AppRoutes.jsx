import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';

// Public Views
import Landing from '../pages/Auth/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/SignUp';

// Admin Views
import AdminDashboard from '../pages/Admin/AdminDashboard';
import StudentManagement from '../pages/Admin/StudentManagement';
import TeacherManagement from '../pages/Admin/TeacherManagement';
import ParentManagement from '../pages/Admin/ParentManagement';
import PhotoApproval from '../pages/Admin/PhotoApproval';
import AdminAnnouncements from '../pages/Admin/AdminAnnouncements';

// Teacher Views
import TeacherDashboard from '../pages/Teacher/TeacherDashboard';
import CreateActivity from '../pages/Teacher/CreateActivity';
import UploadHistory from '../pages/Teacher/UploadHistory';

// Parent Views
import ParentDashboard from '../pages/Parent/ParentDashboard';
import MyChild from '../pages/Parent/MyChild';
import PhotoGallery from '../pages/Parent/PhotoGallery';
import MemoryWall from '../pages/Parent/MemoryWall';
import ActivityTimeline from '../pages/Parent/ActivityTimeline';
import ParentAnnouncements from '../pages/Parent/ParentAnnouncements';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StudentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TeacherManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/parents"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ParentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PhotoApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnnouncements />
          </ProtectedRoute>
        }
      />

      {/* Teacher Protected Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/create-activity"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/history"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <UploadHistory />
          </ProtectedRoute>
        }
      />

      {/* Parent Protected Routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/my-child"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <MyChild />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/gallery"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <PhotoGallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/memory-wall"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <MemoryWall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/timeline"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ActivityTimeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/announcements"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentAnnouncements />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
