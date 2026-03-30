import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CustomerLogin from './pages/CustomerLogin';
import CustomerSignup from './pages/CustomerSignup';
import ManagerLogin from './pages/ManagerLogin';
import ManagerSignup from './pages/ManagerSignup';
import CustomerDashboard from './pages/CustomerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CreateEvent from './pages/CreateEvent';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="customer-login" element={<CustomerLogin />} />
          <Route path="customer-signup" element={<CustomerSignup />} />
          <Route path="manager-login" element={<ManagerLogin />} />
          <Route path="manager-signup" element={<ManagerSignup />} />
        </Route>
        {/* Dashboards and forms do not typically show the same global layout (Navbar/Footer) because they have their own or none in original HTML */}
        <Route path="/dashboard-customer" element={<CustomerDashboard />} />
        <Route path="/dashboard-manager" element={<ManagerDashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
    </Router>
  );
}

export default App;
