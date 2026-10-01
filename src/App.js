import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Home from './pages/Home';
import AdminPreoperation from './pages/AdminPreoperation';
import Preoperational from './pages/Preoperational';
import EditPreOperational from './pages/editPreOperational';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';

import EditForm from './pages/editForm';
import Users from "./pages/Users"
import ChangePassword from './pages/ChangePassword';
import SendRecoveryPassword from "./pages/SendRecoveryPassword"
import RecoveryPassword from './pages/RecoveryPassword';
import Plates from './pages/Plates';
import Page404 from "./pages/Page404"
import Navbar from './components/Navbar';
import PrivateRoute from "./components/PrivateRoute";
import { AuthContextProvider } from './context/authContext';
import { ClientContextProvider } from "./context/clientContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <AuthContextProvider>
      <ClientContextProvider>
        <Router>
          <Navbar />
          <div id='wrapper' className="d-flex vh-100 overflow-auto p-0">
            <Routes>
              <Route path='/' element={<Navigate to="/login" />} />
              <Route path='/login' element={<Login />} />
              <Route path='/home' element={<PrivateRoute component={Home} />} />
              <Route path='/administracion' element={<PrivateRoute component={Users} />} />
              <Route path='/admin/pre/operational' element={<PrivateRoute component={AdminPreoperation} />} />
              <Route path='/pre/operational' element={<PrivateRoute component={Preoperational} />} />
              <Route path='/pre/operational/:id' element={<PrivateRoute component={EditPreOperational} />} />
              <Route path='/vehicle' element={<PrivateRoute component={Vehicles} />} />
              <Route path='/vehicle/:id' element={<PrivateRoute component={Vehicles} />} />
              <Route path='/driver' element={<PrivateRoute component={Drivers} />} />
              <Route path='/driver/:id' element={<PrivateRoute component={Drivers} />} />

              {/* <Route path='/form' element={<PrivateRoute component={Form} />} />
              <Route path='/form/:id' element={<PrivateRoute component={Form} />} /> */}
              <Route path='/drivers' element={<PrivateRoute component={Drivers} />} />
              <Route path='/plates' element={<PrivateRoute component={Plates} />} />
              <Route path='/cambiar/contrasena' element={<PrivateRoute component={ChangePassword} />} />
              <Route path='/enviar/recuperacion' element={<SendRecoveryPassword/>} />
              <Route path='/recuperacion/contrasena/:token' element={<RecoveryPassword/>} />
              <Route path='*' element={<Page404 />} />
            </Routes>
          </div>
        </Router>
      </ClientContextProvider>
    </AuthContextProvider>
  );
}

export default App;
