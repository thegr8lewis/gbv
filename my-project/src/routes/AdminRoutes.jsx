import { Routes, Route } from "react-router-dom";
import Adminlayout from "../pages/Admin/Adminlayout";
import Dashboard from "../pages/Admin/Dashboard";
import Events from "../pages/Admin/EventsandWorkshops";
import Settings from "../pages/Admin/Settings";
import Support from "../pages/Admin/Support";
import Reports from "../pages/Admin/Reports"; 

const AdminRoutes = () => {
  return (
      <Routes>

        <Route path="/" element={<Adminlayout/>}/>
        <Route path="Dashboard" element={<Dashboard/>}/>
        <Route path="Events" element={<Events/>}/>
        <Route path="Settings" element={<Settings/>}/>
        <Route path="Support" element={<Support/>}/>
        <Route path="Reports" element={<Reports/>}/>
      </Routes>
  );
};

export default AdminRoutes;