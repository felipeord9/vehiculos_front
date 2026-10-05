import { useState, useEffect, useCallback, useContext } from "react";
import * as GoIcons from "react-icons/go"
import TableUsers from "../../components/TableUsers"
import ModalUsers from "../../components/ModalUsers";
import { findUsers } from "../../services/userService"
import { IoIosArrowDown } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { FaTruck } from "react-icons/fa";
import { FaClipboardUser } from "react-icons/fa6";
import AuthContext from "../../context/authContext";
import { findAgencies } from "../../services/agencyService";
import { findVehicles, findVehiclesByCo } from "../../services/vehicleService";
import TableVehicles from "../../components/TableVehicles";
import { findDrivers, findDriversByCo } from "../../services/driverService";
import TableDrivers from "../../components/TableDrivers";
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import { HiUserGroup } from "react-icons/hi";
import * as Bs from "react-icons/bs";
import * as Icons from 'lucide-react';
import './styles.css'

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalUsers, setShowModalUsers] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isLogged, logout } = useUser();
  const { user } = useContext(AuthContext);
  const [agencies, setAgencies] = useState({});
  const navigate = useNavigate();

  //constantes de vehiculos
  const [vehicles, setVehicles] = useState([]);
  const [suggesVehicles, setSuggesVehicles] = useState([]);
  const [searchVehicle, setSearchVehicle] = useState('');
  const [showModalVehicle, setShowModalVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  //constantes de conductores
  const [drivers, setDrivers] = useState([]);
  const [suggesDrivers, setSuggesDrivers] = useState([]);
  const [searchDriver, setSearchDriver] = useState('');
  const [showModalDriver, setShowModalDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAllUsers(),
      findAgencies().then(({data})=>setAgencies(data)),
      getAllVehicles(),
      getAllDrivers(),
    ])
    setLoading(false)
  }, []);

  const getAllUsers = () => {
    findUsers()
      .then(({ data }) => {
        setUsers(data)
        setSuggestions(data)
      })
      .catch((error) => {
        console.log('error user')
      });
  }

  const getAllVehicles = () => {
    if(user.role === 'admin'){
      findVehicles()
        .then(({ data }) => {
          setVehicles(data)
          setSuggesVehicles(data)
        })
        .catch((error) => {
          console.log('error vehicles')
        });
    } else if(user.role === 'jefe' || user.role === 'usuario'){
      findVehiclesByCo(user.co)
      .then(({ data }) => {
          setVehicles(data)
          setSuggesVehicles(data)
        })
        .catch((error) => {
          console.log('error vehicles')
        });
    }
  }

  const getAllDrivers = () => {
    if(user.role === 'admin'){
      findDrivers()
        .then(({ data }) => {
          setDrivers(data)
          setSuggesDrivers(data)
        })
        .catch((error) => {
          console.log('error drivers')
        });
    } else if(user.role === 'jefe' || user.role === 'usuario'){
      findDriversByCo(user.co)
      .then(({ data }) => {
          setDrivers(data)
          setSuggesDrivers(data)
        })
        .catch((error) => {
          console.log('error drivers')
        });
    }
  }

  const searchUsers = (e) => {
    const { value } = e.target
    setSearch(value)
    if(value !== "") {
      const filteredUsers = users.filter((elem) => {
        if(
          elem.rowId.includes(value) ||
          elem.name.toLowerCase().includes(value.toLowerCase()) ||
          elem.role.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions('')
     }
    } else {
      setSuggestions(users)
    }
    setSearch(value)
  }

  const searchVehicles = (e) => {
    const { value } = e.target
    setSearchVehicle(value)
    if(value !== "") {
      const filteredVehicles = vehicles.filter((elem) => {
        if(
          elem.plate.includes(value.toUpperCase())
        ) {
          return elem
        }
      })
      if(filteredVehicles.length > 0) {
        setSuggesVehicles(filteredVehicles)
      } else {
        setSuggesVehicles('')
     }
    } else {
      setSuggesVehicles(vehicles)
    }
  }

  const searchDrivers= (e) => {
    const { value } = e.target
    setSearchDriver(value)
    if(value !== "") {
      const filteredDrivers = drivers.filter((elem) => {
        if(
          elem.rowId.includes(value) ||
          elem.name.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredDrivers.length > 0) {
        setSuggesDrivers(filteredDrivers)
      } else {
        setSuggesDrivers('')
     }
    } else {
      setSuggesDrivers(drivers)
    }
  }

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };
  
    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener('resize', handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto
  
    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {(isLogged && (user.role === 'admin' || user.role === 'jefe')) &&
        <div className="d-flex flex-column container mt-5">
          <ModalUsers 
            user={selectedUser}
            setUser={setSelectedUser}
            showModal={showModalUsers} 
            setShowModal={setShowModalUsers} 
            reloadInfo={getAllUsers} 
            agencies={agencies}
          />
          {/* usuarios */}
          {user.role === 'admin' &&
            <div className="card mb-3 border-0 shadow-sm bg-light">
              <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-primary mb-1">
                    <HiUserGroup className="me-2"/> Usuarios
                  </h5>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseUsers"
                    aria-expanded="true"
                    aria-controls="collapseUsers"
                    style={{ fontSize: 20 }}
                  >
                    <IoIosArrowDown />
                  </button>
                </div>
              </div>
              
              {/* 👈 AGREGADA LA CLASE "show" AQUÍ PARA QUE ABRA POR DEFECTO */}
              <div className="collapse show" id="collapseUsers">
                <div className="card-body pt-0 d-flex flex-column w-100">
                  <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-end mt-2 gap-3 mb-2`}>
                    <input
                      type="text"
                      value={search}
                      className="form-control form-control-sm w-100"
                      placeholder="Buscar usuario"
                      onChange={(e)=>searchUsers(e)}
                      style={{textTransform: 'uppercase'}}
                    />
                    <button
                      title="Nuevo usuario"
                      className="d-flex align-items-center text-nowrap btn btn-sm btn-primary text-light gap-1" 
                      onClick={(e) => setShowModalUsers(!showModalUsers)}>
                        Nuevo usuario
                        <GoIcons.GoPersonAdd style={{width: 15, height: 15}} />
                    </button>
                  </div>
                  <TableUsers users={suggestions} setShowModal={setShowModalUsers} setSelectedUser={setSelectedUser} loading={loading}/>
                </div>
              </div>
            </div>
          }

          {/* vehiculos */}
          <div className="card mb-3 border-0 shadow-sm bg-light">
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="fw-bold mb-1" style={{color: '#f36d5e'}}>
                  <FaTruck className='me-2'/>Vehículos
                </h5>
              </div>
              <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1 collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseVehiculos"
                    aria-expanded="false"
                    aria-controls="collapseVehiculos"
                    style={{ fontSize: 20 }}
                  >
                    <IoIosArrowDown />
                  </button>
              </div>
            </div>
            <div className={`collapse ${user.role === 'jefe' && 'show'}`} id="collapseVehiculos">
              <div className="card-body pt-0 d-flex flex-column w-100">
                <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-end mt-2 gap-3 mb-2`}>
                  <input
                    type="text"
                    value={searchVehicle}
                    className="form-control form-control-sm w-100"
                    placeholder="Buscar vehiculo por placa"
                    onChange={(e)=> searchVehicles(e)}
                    style={{textTransform: 'uppercase'}}
                  />
                  <button
                    title="Nuevo usuario"
                    className="d-flex align-items-center text-nowrap btn btn-sm text-light gap-1" 
                    style={{backgroundColor:'#f36d5e', color:'white'}}
                    onClick={(e) => navigate('/vehicle')}>
                      Nuevo vehiculo <FaTruck />
                  </button>
                </div>
                <TableVehicles vehicles={suggesVehicles} setShowModal={setShowModalVehicle} setSelectedVehicle={setSelectedVehicle} loading={loading}/>
              </div>
            </div>
          </div>

          {/* conductores */}
          <div className="card mb-3 border-0 shadow-sm bg-light">
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="fw-bold text-success mb-1">
                  <FaClipboardUser className='me-2'/>Conductores
                </h5>
              </div>
              <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1 collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseConductor"
                    aria-expanded="false"
                    aria-controls="collapseConductor"
                    style={{ fontSize: 20 }}
                  >
                    <IoIosArrowDown />
                  </button>
              </div>
            </div>
              <div className="collapse" id="collapseConductor">
                <div className="card-body pt-0 d-flex flex-column w-100">
                  <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-end mt-2 gap-3 mb-2`}>
                    <input
                      type="text"
                      value={searchDriver}
                      className="form-control form-control-sm w-100"
                      placeholder="Buscar conductor por cédula o nombre"
                      onChange={(e)=> searchDrivers(e)}
                      style={{textTransform: 'uppercase'}}
                    />
                    <button
                      title="Nuevo usuario"
                      className="d-flex align-items-center text-nowrap btn btn-sm btn-success text-light gap-1" 
                      onClick={(e) => navigate('/driver')}>
                        Nuevo Conductor
                        <FaClipboardUser style={{width: 15, height: 15}} />
                    </button>
                  </div>
                  <TableDrivers drivers={suggesDrivers} setShowModal={setShowModalDriver} setSelectedDriver={setSelectedDriver} loading={loading}/>
                </div>
              </div>
          </div>
        </div>
      }
    </>
  )
}