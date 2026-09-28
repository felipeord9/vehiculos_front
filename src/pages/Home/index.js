import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as VscIcons from "react-icons/vsc";
import * as XLSX from "xlsx";
import AuthContext from "../../context/authContext";
import { MdPriceChange } from "react-icons/md";
import { NavBarData } from "../../components/Navbar/NavbarData";
import useUser from "../../hooks/useUser";
import KpiCard from '../../components/KpiCard';
import { saveAs } from "file-saver"
import Swal from "sweetalert2";
import './styles.css';

export default function Home() {
  const { user } = useContext(AuthContext);
  const { isLogged, logout } = useUser();
  const navItems = NavBarData(user);
  const [washes, setWashes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [lengthModules, setLengthModules] = useState();
  const [permissions, setPermissions] = useState('');
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const refTable = useRef();
  const [typeFillDate, setTypeFillDate] = useState('');

  useEffect(() => {
    const tamano = navItems.map((module, idx) => {
      if (module.access.includes(user.role)) {
        return module
      }}
    )
    const permi = navItems.map((item)=>{
      if(item.access.includes(user.role)){
        return `${item.title}, `
      }
    })
    setLengthModules(tamano.length)
    setPermissions(permi)
  }, []);

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

  const handleChangeFilterDate = (e) => {
    const { id, value } = e.target;
    setFilterDate({
      ...filterDate,
      [id]: value,
    });
  };

  const handleFilterDate = () => {
    if(filterDate.finalDate !== null && filterDate.initialDate !== null){
      const initialDate = new Date(filterDate?.initialDate?.split('-').join('/')).toLocaleDateString();
      const finalDate = new Date(filterDate?.finalDate?.split('-').join('/')).toLocaleDateString();
      const filtered = washes.filter((elem) => {
        const splitDate = new Date(elem.createdAt).toLocaleDateString();
        if (splitDate >= initialDate && splitDate <= finalDate) {
          return elem;
        }
        return 0;
      });
      if(filtered.length > 0) {  
        setSuggestions(filtered)
      } else {
        setSuggestions([])
      }
    }
  }

  const removeFilterDate = () => {
    setFilterDate({
      initialDate: '',
      finalDate: '',
    });
    setTypeFillDate('');
  };

  const searchReturns = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = washes.filter((elem) => {
        if (
          elem.driverName.toLowerCase().includes(value) ||
          elem.plate.toLowerCase().includes(value)
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(washes)
     }
    } else {
      setSuggestions(washes)
    }
    setSearch(value)
  }

  // Función para aplicar estilos a los títulos
  const applyStylesToHeaders = (worksheet, data) => {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const headers = Object.keys(data[0]);

    // Estilos para celdas de encabezado
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DCE6F1" } }, // Fondo azul claro
      };
    }

    // Ancho dinámico para columnas
    const columnWidths = headers.map((key) => {
      const maxContent = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxContent + 2 };
    });

    worksheet["!cols"] = columnWidths;
  };

  const handleDownload = (data) => {
    // Lógica para exportar la tabla a un Excel
    const filteredData = data.map((item) => {
      const conductor = item?.driverName?.toUpperCase();
      const placa = item?.plate?.toUpperCase();
      const factura = item.bill !== null ? 'Si' : 'No';
      const evidencia = item.evidence !== null ? 'Si' : 'No';
      const createdAt = new Date(item.createdAt).toLocaleString("es-CO");
      const createdBy = item?.createdBy;
      const observations = item?.observations;

      return {
        'Conductor': conductor,
        'Placa': placa,
        'Foto factura': factura,
        'Vídeo evidencia': evidencia,
        'Fecha creación': createdAt,
        'Creado por': createdBy,
        'Observaciones': observations,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    applyStylesToHeaders(worksheet, filteredData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const filename = `lavados_Reporte ${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    saveAs(dataBlob, `${filename}.xlsx`);
  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column h-100 gap-2">
        {isLogged && (
          <div className="container-fluid p-2">

            {/* Grid de KPIs superiores */}
            {isMobile ?
              <h1 className="d-flex justify-content-center main-title">Menú principal</h1>
              :
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <KpiCard title="Módulos disponibles" value={lengthModules} subtitle="Activos para tu perfil" />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <KpiCard title="Rol activo" value={user?.role || 'Administrador'} subtitle={permissions} />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <KpiCard title="Usuario iniciado" value={user.username} subtitle={user.name} />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <KpiCard title="Base de datos" value={'Local'} subtitle={'PostgreSql'} />
                </div>
              </div>
            }
          
            {/* Grid de Accesos Directos a Módulos */}
            <div className="row g-3">
              {navItems.map((module, idx) => {
                if (module.access.includes(user.role)) {
                  return (
                  <div key={idx} className="col-12 col-md-6 col-lg-4">
                    <button 
                      className={`module-card w-100 ${isMobile ? 'p-2 pt-4':'p-4'} text-start rounded shadow-sm position-relative`}
                      onClick={() => navigate(module.path)}
                      style={{ transition: 'all 0.2s' }}
                    >
                      <div className="d-flex align-items-start mb-3">
                        <div className="p-2 rounded bg-success bg-opacity-10 text-success me-3" style={{fontSize: 24}}>
                          {module.icon}
                        </div>
                        <div>
                          <h3 className="h5 fw-bold mb-1">{module.title}</h3>
                          <p className=" small mb-0">{module.description || 'Módulo disponible'}</p>
                        </div>
                      </div>
                      
                      <span className={`position-absolute bottom-0 end-0 m-3`}>
                        v{module.version}
                      </span>
                    </button>
                  </div>
                  )
                }
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
