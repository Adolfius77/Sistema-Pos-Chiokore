import { Outlet } from "react-router-dom";
import AdminSideBar from "./AdminSideBar.jsx";

const AdminLayout = ({ onLogout, sidebarOpen, onCloseSidebar }) => {
    return (
        <div className="flex">
            {sidebarOpen && <div className="sidebar-overlay" onClick={onCloseSidebar} />}
            <AdminSideBar onLogout={onLogout} sidebarOpen={sidebarOpen} />
            <div className="content admin-content" onClick={onCloseSidebar}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
