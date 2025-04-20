import { Routes, Route } from "react-router-dom";
import About from "../pages/User/About";
import Emergency from "../pages/User/Emergency";
import Home from "../pages/User/Home";
import Report from "../pages/User/Report";
import Update from "../pages/User/Updates";
import GBVApp from "../pages/User/SGBVApp";
import Layout from '../pages/User/Layout';

const UserRoutes = () => {
  return (

    <Layout>
      <Routes>
        <Route path="/" element={<GBVApp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/about" element={<About />} />
        <Route path="/updates" element={<Update />} />
      </Routes>
    </Layout>

  );
};

export default UserRoutes;
