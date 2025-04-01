import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetails from "./pages/MachineDetails";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/machines" element={<Machines />} />
                <Route path="/machines/:serial" element={<MachineDetails />} />
                <Route path="*" element={<>Not found</>} />
            </Route>
        </Routes>
    );
}

export default App;
