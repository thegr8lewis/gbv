import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";


function App() {
  return (
    <Router>
      <Routes>
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="*" element={<UserRoutes />} />

      </Routes>
    </Router>
  );
}

export default App;