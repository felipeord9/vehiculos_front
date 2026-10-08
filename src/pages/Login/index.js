import { useState, useEffect , useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputPassword from "../../components/InputPassword";
import useUser from "../../hooks/useUser";
import AuthContext from "../../context/authContext";
import Logo from "../../assets/logo-el-gran-langostino.png";
import { FaUserAlt } from "react-icons/fa";
import "./styles.css";

export default function Login() {
  const { login, isLoginLoading, hasLoginError, isLogged } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (
      isLogged && user.role==='admin' || isLogged && user.role==='usuario' ||
      isLogged && user.role==='jefe'
     ){
      navigate('/home')
    }
  }, [isLogged, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if(email !== '' && password !== ''){
      login({email,password})
    }
  };

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
    <div className="d-flex justify-content-center align-items-center h-100 w-100 m-auto">
      <div
        className={`card ${isMobile ? 'p-3':'p-5 ps-4 pe-4'} d-flex flex-row shadow rounded-4 m-auto`}
        style={{ maxWidth: isMobile ? 370 : '65vw', border: '3px solid #007bff' }}
      >
        {!isMobile &&
          <div className="col-12 col-sm-12 col-md-6" style={{borderRight: '2px #007bff solid'}}>
            <div className="mb-3 p-2 d-flex justify-content-center">
              <img src={Logo} className="w-75 logo" alt="logo" />
            </div>
            <div className="p-2 d-flex justify-content-center">
              <h5 className="">Sistema Integral de Gestión Vehicular</h5>
            </div>
          </div>
        }
        <div className="col-12 col-sm-12 col-md-6">
          <form
            className="d-flex flex-column gap-2 justify-content-center align-items-center"
            style={{ fontSize: 13.5 }}
            onSubmit={handleLogin}
            >
            {isMobile ?
              <div className="mb-3 p-2">
                <img src={Logo} className="w-100 logo" alt="logo" />
              </div>
              :
              <div>
                <h3 style={{color: '#007bff'}}>Inicio de sesión</h3>
              </div>
            } 
            <div className="input-group ms-0 ps-0 w-75 d-flex">
              <span className="input-group-text bg-white ms-0"><i class="bi bi-person-fill"><FaUserAlt  /></i></span>
              <input
                type="text"
                value={email}
                className="form-control form-control-sm shadow-sm"
                placeholder="Usuario"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-75">
              <InputPassword
                label="Contraseña"
                password={password}
                setPassword={setPassword}
              />
            </div>
            <button
              type="submit"
              className="text-light btn btn-sm btn-login mt-1 w-75"
              style={{ backgroundColor: "#007bff" }}
            >
              Ingresar
            </button>
          </form>
          {isLoginLoading && <div className="loading">Cargando...</div>}
          {hasLoginError && (
            <div className="text-danger text-center mt-2 d-flex justify-content-center align-items-center">
              Usuario o contraseña incorrectos
            </div>
          )}
          {/* <Link
            to="/enviar/recuperacion"
            className="text-primary text-center text-decoration-none mt-2 d-flex justify-content-center align-items-center"
          >
            ¿Olvidó su contraseña?
          </Link> */}
        </div>
      </div>
    </div>
  );
}
