import { Routes, Route } from "react-router-dom";
import About from "../pages/User/About";
import Emergency from "../pages/User/Emergency";
import Home from "../pages/User/Home";
import Report from "../pages/User/Report";
import Update from "../pages/User/Updates";
import GBVApp from "../pages/User/SGBVApp";

const UserRoutes = () => {
  return (
      <Routes>

        <Route path="/" element={<GBVApp/>}/>
        <Route path="about" element={<About/>}/>
        <Route path="home" element={<Home/>}/>
        <Route path="emergency" element={<Emergency/>}/>
        <Route path="Report" element={<Report/>}/>
        <Route path="update" element={<Update/>}/>

      </Routes>
  );
};

export default UserRoutes;
