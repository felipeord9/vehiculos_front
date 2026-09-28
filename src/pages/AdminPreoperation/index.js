import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as VscIcons from "react-icons/vsc";
import * as XLSX from "xlsx";
import TablePreOperation from "../../components/TablePreOperation";
import { findRecords, findRecordsByAgency, findRecordsByUser } from "../../services/preOperationalService";
import AuthContext from "../../context/authContext";
import useUser from "../../hooks/useUser";
import { MdPriceChange } from "react-icons/md";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import './styles.css'

export default function AdminPreoperation() {
  const { user } = useContext(AuthContext);
  const { isLogged, logout } = useUser();
  const [records, setRecords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const refTable = useRef();
  const [typeFillDate, setTypeFillDate] = useState('');

  useEffect(()=>{
    setLoading(true)
    if(user.role === 'admin'){
      findRecords()
        .then(({data}) => (setRecords(data), setSuggestions(data), setLoading(false)))
    } else if(user.role === 'jefe'){
      findRecordsByAgency(user.co)
        .then(({data}) => (setRecords(data), setSuggestions(data), setLoading(false)))
    } else if(user.role === 'usuario'){
      findRecordsByUser(user.username)
        .then(({data}) => (setRecords(data), setSuggestions(data), setLoading(false)))
    } else {
      logout()
    }
  },[])

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
      const filtered = records.filter((elem) => {
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
      const filteredUsers = records.filter((elem) => {
        if (
          elem.driver.toLowerCase().includes(value) ||
          elem.plate.toLowerCase().includes(value)
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
      setSuggestions(records)
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
      const plate = item?.plate?.toUpperCase();
      const typeVehicle = item?.typeVehicle?.toUpperCase();
      const rowId = item?.rowId?.toUpperCase();
      const driver = item?.driver?.toUpperCase();
      const health = item?.health?.toUpperCase();
      const diagnosis = item?.diagnosis?.toUpperCase();
      const co = item?.co?.toUpperCase();
      const createdAt = new Date(item.createdAt).toLocaleString("es-CO");
      const createdBy = item?.createdBy;
      const lastKm = item?.lastKm?.toUpperCase();
      const licenciaConduccion = item?.licenciaConduccion?.toUpperCase();
      const licenciaTransito = item?.licenciaTransito?.toUpperCase();
      const soat = item?.soat?.toUpperCase();
      const tecno = item?.tecno?.toUpperCase();
      const cedula = item?.cedula?.toUpperCase();
      const aceiteMotor = item?.aceiteMotor?.toUpperCase();
      const liquidoFrenos = item?.liquidoFrenos?.toUpperCase();
      const nivelCombustuble = item?.nivelCombustuble?.toUpperCase();
      const liquidoRefrigerante = item?.liquidoRefrigerante?.toUpperCase();
      const llantas = item?.llantas?.toUpperCase();
      const lucesPrincipales = item?.lucesPrincipales?.toUpperCase();
      const lucesDireccionales = item?.lucesDireccionales?.toUpperCase();
      const luzStop = item?.luzStop?.toUpperCase();
      const estadoFrenos = item?.estadoFrenos?.toUpperCase();
      const maniguetaFrenos = item?.maniguetaFrenos?.toUpperCase();
      const casco = item?.casco?.toUpperCase();
      const calzado = item?.calzado?.toUpperCase();
      const chaleco = item?.chaleco?.toUpperCase();
      const impermeable = item?.impermeable?.toUpperCase();
      const guardabarros = item?.guardabarros?.toUpperCase();
      const sillin = item?.sillin?.toUpperCase();
      const reposaPies = item?.reposaPies?.toUpperCase();
      const espejoLateral = item?.espejoLateral?.toUpperCase();
      const pito = item?.pito?.toUpperCase();
      const cadena = item?.cadena?.toUpperCase();
      const pataEncendido = item?.pataEncendido?.toUpperCase();
      const protectorExhosto = item?.protectorExhosto?.toUpperCase();
      const maletin = item?.maletin?.toUpperCase();
      const velocimetro = item?.velocimetro?.toUpperCase();
      const portaPlaca = item?.placa?.toUpperCase();
      const clutch = item?.clutch?.toUpperCase();
      const fallas = item?.fallas?.toUpperCase();
      const resumenFallas = item?.resumenFallas?.toUpperCase();
      const evidencia = item.evidencia === true ? 'Si' : 'No';

      return {
        'Placa': plate,
        'Tipo de Vehículo': typeVehicle,
        'Id Conductor': rowId,
        'Nombre Conductor': driver,
        'Estado de salud': health,
        'Especificacion': diagnosis,
        'C.O.': co,
        'Fecha Creación': createdAt,
        'Creado por': createdBy,
        'Ultimo Kilometraje': lastKm,
        'Porta Licencia de Conducción': licenciaConduccion,
        'Porta Licencia de Transito': licenciaTransito,
        'Porta Soat': soat,
        'Porta Tecno Mecánica': tecno,
        'Porta cédula': cedula,
        'Aceite Motor': aceiteMotor,
        'Liquido de Frenos': liquidoFrenos,
        'Nivel Combustible': nivelCombustuble,
        'Líquido Refrigerante': liquidoRefrigerante,
        'Llantas': llantas,
        'Luces Principales': lucesPrincipales,
        'Luces Direccionales': lucesDireccionales,
        'Luz de Stop': luzStop,
        'Estado de Frenos': estadoFrenos,
        'Manigueta de Frenos': maniguetaFrenos,
        'Casco Certificado': casco,
        'Calzado Cerrado': calzado,
        'Chaleco Reflectivo': chaleco,
        'Equipo Impermehable': impermeable,
        'GuardaBarros': guardabarros,
        'Sillin': sillin,
        'ReposaPies': reposaPies,
        'Espojos Laterales': espejoLateral,
        'Pito': pito,
        'Cadena': cadena,
        'Pata de Encendido': pataEncendido,
        'Protector de Exhosto': protectorExhosto,
        'Maletín': maletin,
        'Velocimetro': velocimetro,
        'Estado Placa': portaPlaca,
        'Clutch Embrague': clutch,
        'Presenta Falllas': fallas,
        'Resumen de la Falla': resumenFallas,
        'Subió evidencia': evidencia,
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
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column h-100 gap-2">
        <div className={`${isMobile ? 'd-flex flex-column' : 'd-flex flex-row'} div-botons justify-content-center mt-2 gap-2 w-100`}>
          <div className="d-flex flex-row w-100 gap-2">
            <form
              className="position-relative d-flex justify-content-center w-100"
              onSubmit={searchReturns/* findOrder */}
            >
              <input
                type="search"
                value={search}
                className="form-control form-control-sm"
                style={{paddingRight: 35, textTransform:'uppercase'}}
                placeholder="Buscar por placa o conductor"
                /* onChange={(e) => setSearch(e.target.value)} */
                onChange={(e)=>searchReturns(e)}
              />
              <button
                type="submit"
                className="position-absolute btn btn-sm"
                style={{ right: 0 }}
              >
                  {search?.length ? <FaIcons.FaSearch /> : <VscIcons.VscDebugRestart />}
              </button>
            </form>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FaIcons.FaFilter className="me-2"/>
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu p-0 m-0">
                {/* <label className="d-flex w-100 text-primary fw-bold ms-2">Tipo de filtro:</label> */} 
                <li className="d-flex flex-row gap-2 mb-1 mt-2">
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm ms-2"
                    max={(filterDate.finalDate !== null) ? filterDate.finalDate : new Date().toISOString().split("T")[0]}
                    onChange={handleChangeFilterDate}
                  />
                  -
                  <input
                    id="finalDate"
                    type="date"
                    value={filterDate.finalDate}
                    className="form-control form-control-sm me-2"
                    min={filterDate.initialDate}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={filterDate.initialDate === null}
                    onChange={handleChangeFilterDate}
                  />
                  
                </li>
                  <li className="gap-2 d-flex p-1">
                      <button
                        className="btn btn-sm btn-primary w-100"
                        onClick={(e)=>handleFilterDate(e)}
                      >
                        Filtrar
                      </button>
                      <button
                        className="btn btn-sm btn-danger w-100"
                        onClick={removeFilterDate}
                      >
                        Borrar filtro
                      </button>
                  </li>
              </ul>
            </div>
            <button
              title="Descargar Excel"
              className="btn btn-sm btn-success"
              onClick={(e) => handleDownload(suggestions)}
            >
              <FaIcons.FaDownload />
            </button>
          </div> 
          <div>
            {(user.role === 'admin' || user.role === 'usuario' ) &&
              <button
                title="Nuevo registro"
                className={`d-flex align-items-center text-nowrap btn btn-sm btn-primary text-light gap-1 h-100 ${isMobile && 'w-100'}`}
                onClick={(e) => navigate("/pre/operational")}
              >
                Nuevo registro
                <HiIcons.HiDocumentAdd style={{ width: 15, height: 15 }} />
              </button>
            }
          </div> 
        </div>
        <TablePreOperation ref={refTable} records={suggestions} /* getAllOrders={getAllOrders} */ loading={loading} />
      </div>
    </div>
  );
}
