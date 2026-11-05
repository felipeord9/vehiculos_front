import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // 1. Importamos useLocation
import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa";
import AuthContext from "../../context/authContext";
import { useNotifications } from "../../context/notificationContext";
import useUser from "../../hooks/useUser";
import { agregarNombreNoti, findNotifications, findNotificationsToday, findNotificationsTodayByCo, updateNotification } from "../../services/notificationService"
import { NavBarData } from "./NavbarData";
import Logo from "../../assets/logo-el-gran-langostino.png";
import { LuRefreshCcw } from "react-icons/lu";
import "./styles.css";

export default function Navbar() {
  const { isLogged, logout } = useUser();
  const [showSideBar, setShowSidebar] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // 2. Hook nativo para rastrear la ruta activa
  const navItems = user && NavBarData(user);
  const {
    notificaciones,
    setNotificaciones,
    noLeidas,
    loadingNotifications
  } = useNotifications();

  // Lógica para detectar pantalla móvil
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClickImg = () => {
    navigate("/home");
  };

  const [buscando, setBuscando] = useState(false);

  //modal para mostrar notificacion individual
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState('');
  const closeModal = () => {
    setSelectedNotification('');
    setShowModal(false);
  };
  const openModal = (e, notifi) => {
    setSelectedNotification(notifi);
    setShowModal(true);
  };
  
  const marcarComoLeidas = async (e, id) => {
    const notifi = notificaciones.find(item => item.id === id);

    if (!notifi) return;

    // Obtener los usuarios que ya leyeron la notificación
    const usuariosQueLeyeron = String(notifi.leidoPor || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    // Evitar agregar el mismo usuario dos veces
    if (usuariosQueLeyeron.includes(String(user.id))) {
      openModal(e, notifi);
      return;
    }

    // Agregar el usuario actual
    usuariosQueLeyeron.push(String(user.id));
      
    const changes = {
      nuevoNombre: user.id
    }
    await agregarNombreNoti(id, changes)

    // Actualizar el estado local
    const notificacionActualizada = {
      ...notifi,
      leidoPor: usuariosQueLeyeron.join(", ")
    };

    setNotificaciones(prev =>
      prev.map(n =>
        n.id === id ? notificacionActualizada : n
      )
    );

    openModal(e, notificacionActualizada);
  };

  return (
    <>
    {isLogged &&
      <div
        className="position-fixed shadow w-100"
        style={{ fontSize: 11, left: 0, height: "50px", zIndex: 2, backgroundColor: "white" }}
      >
        <div className={`d-flex flex-row justify-content-between align-items-center w-100 h-100 ${isMobile ? "px-2" : "px-4"} shadow`}>
          {/* LOGO & HAMBURGER */}
          <div id="logo-header" className="d-flex flex-row align-items-center gap-2">
            <span className="menu-bars m-0" style={{ cursor: "pointer" }}>
              <FaIcons.FaBars
                className="text-primary"
                onClick={() => setShowSidebar(!showSideBar)}
              />
            </span>
            <img
              src={Logo}
              width={100}
              className="navbar-img"
              onClick={handleClickImg}
              alt="Logo El Gran Langostino"
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* USER PROFILE & DROPDOWN */}
          <div className="d-flex flex-row align-items-center">
            <div
              className="d-flex align-items-center position-relative bg-primary rounded-pill p-2 pe-4"
              style={{ right: "-20px", height: 25 }}
            >
              <span className="text-light text-nowrap m-0">{user?.name}</span>
            </div>
            <div
              id="btn-session"
              className="dropdown"
              style={{ width: "40px", height: "40px" }}
            >
              <button
                className="d-flex align-items-center btn btn-primary rounded-circle w-100 h-100 m-0 p-0 border border-2 border-light overflow-hidden"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                data-bs-offset="0,10"
              >
                <FaIcons.FaUser className="w-100" />
              </button>
              <ul
                className="dropdown-menu text-center p-0 rounded-3"
                style={{ width: "250px" }}
              >
                <li className="border-bottom">
                  <p className="fw-bold mt-1 mb-1">
                    {user?.role?.toUpperCase()}
                  </p>
                </li>
                <li style={{ cursor: "pointer" }} className="border-bottom">
                  <Link to="/cambiar/contrasena" className="text-decoration-none">
                    <p className="dropdown-item fw-bold m-0">
                      CAMBIAR CONTRASEÑA
                    </p>
                  </Link>
                </li>
                <li style={{ cursor: "pointer" }} onClick={logout}>
                  <p className="d-flex justify-content-center align-items-center gap-2 dropdown-item fw-bold text-danger m-0">
                    CERRAR SESIÓN
                    <FiIcons.FiLogOut />
                  </p>
                </li>
              </ul>
            </div>
            {(user.role === 'admin' || user.role === 'jefe') &&
              <div 
                className="dropdown ms-1 btn btn-danger"
                style={{
                  position: 'relative',
                  color: 'white',
                  borderRadius: '50%',
                  width: 37,
                  height: 37,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                }}
              >
                <button
                  className="btn p-1 position-relative d-flex align-items-center justify-content-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ background: 'transparent', boxShadow: 'none'}}
                >
                  <FaIcons.FaBell className="text-white" style={{ cursor: 'pointer' , fontSize: 18 }} />
                  
                  {noLeidas > 0 && (
                    <span 
                      className="position-absolute top-0 start-50 translate-middle badge rounded-circle bg-primary border border-light d-flex align-items-center justify-content-center"
                      style={{ fontSize: '9px', width: '16px', height: '16px', padding: 0 }}
                    >
                      {noLeidas}
                    </span>
                  )}
                </button>

                {/* Menú desplegable de las notificaciones */}
                <ul 
                  className="dropdown-menu dropdown-menu-end shadow rounded-3 p-0 mt-2"
                  style={{ width: "280px", maxHeight: "350px", overflowY: "auto" }}
                >
                  <li 
                    className="p-2 border-bottom bg-danger text-light rounded-top-3 text-center fw-bold"
                    onClick={(e) => { e.stopPropagation(); }}
                    style={{ cursor: 'auto' }}
                  >
                    NOTIFICACIONES
                  </li>
                  {notificaciones.length === 0 ? (
                    <li 
                      className="p-3 text-center text-muted"
                      onClick={(e) => { e.stopPropagation(); }}
                      style={{ cursor: 'auto' }}
                    >No tienes notificaciones</li>
                  ) : (
                    notificaciones
                    .slice()
                    .sort((a, b) => b.id - a.id)
                    .map((notif) => (
                      <li
                        key={notif.id} 
                        className="border-bottom dropdown-item p-2 text-wrap" 
                        style={{ whiteSpace: 'normal', cursor: 'pointer' }}
                        // CAMBIO CLAVE: Al hacer clic a la fila, se marca individualmente
                        onClick={(e) => (e.stopPropagation(), marcarComoLeidas(e, notif.id))}
                      >
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <p
                            className={`m-0 ${
                              !String(notif.leidoPor || "")
                                .split(",")
                                .map(id => id.trim())
                                .includes(String(user.id))
                                ? 'fw-bold text-dark'
                                : 'text-secondary'
                            } d-flex flex-column`}
                            style={{ fontSize: '11px', flex: 1 }}
                          >
                            El vehículo: {notif.adjunto1}, no ha diligenciado el formulario pre-operacional del día: {new Date().toLocaleDateString()}
                          </p>
                          {!String(notif.leidoPor || "")
                            .split(",")
                            .map(id => id.trim())
                            .includes(String(user.id)) && (
                              <span
                                className="bg-primary rounded-circle"
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  flexShrink: 0
                                }}
                                title="No leído"
                              />
                          )}
                        </div>
                      </li>
                    ))
                  )}
                  {/* <li 
                    className="p-1 bg-primary text-light rounded-top-3 text-center fw-bold"
                    onClick={(e)=>{
                      e.stopPropagation();
                      handleCompare(e)
                    }}
                  >
                    <LuRefreshCcw className="me-1"/>
                    {buscando ?
                      'Cargando...'
                      :
                      'Refresh' 
                    }
                  </li> */}
                </ul>
              </div>
            }
          </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <nav className={showSideBar ? "bg-light nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={() => setShowSidebar(false)}>
            {navItems && navItems.map((item, index) => {
              if (item.access.includes(user?.role)) {
                // Comprobamos si la ruta actual coincide con la del item
                const isActive = location.pathname === item.path;

                return (
                  <li key={index} className={item.cName}>
                    <Link
                      to={item.path}
                      style={{
                        backgroundColor: isActive ? "#007bff" : "transparent",
                        color: isActive ? "white" : "black",
                      }}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
          <ul className="nav-menu-items">
            <li className="text-center text-secondary">
              <span className="m-0">Gran Langostino S.A.S - v4.0.1</span>
            </li>
          </ul>
        </nav>
      </div>
    }
    </>
  );
}