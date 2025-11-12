import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminTopbar />
        <div className="admin-page-content">
          <Outlet /> {/* This is where the pages (Dashboard, ManageCakes) will render */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;