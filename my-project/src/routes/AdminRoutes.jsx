import { Routes, Route } from "react-router-dom";
import Adminlayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Events from "../pages/Admin/EventsandWorkshops";
import Settings from "../pages/Admin/Settings";
import Support from "../pages/Admin/Support";
import Reports from "../pages/Admin/Reports";
import Login from "../pages/Admin/Login";
import Updates from "../pages/Admin/Updates";

const AdminRoutes = () => {
  return (
      <Routes>

        <Route path="/" element={<Login/>}/>
        <Route path="adminlayout" element={<Adminlayout/>}/>
        <Route path="Dashboard" element={<Dashboard/>}/>
        <Route path="Events" element={<Events/>}/>
        <Route path="Settings" element={<Settings/>}/>
        <Route path="Support" element={<Support/>}/>
        <Route path="Updates" element={<Updates/>}/>
        <Route path="Reports" element={<Reports/>}/>
      </Routes>
  );
};

export default AdminRoutes;