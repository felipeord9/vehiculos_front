import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDriver, findBycedula, findDrivers, findOneDriver, updateDriver } from '../../services/driverService';
import { sendMail, sendMail2, sendMailNews, sendMailNotCondition } from "../../services/mailService";
import AuthContext from "../../context/authContext";
import { findVehicles } from '../../services/vehicleService'
import ComboBox from "../../components/ComboBox";
import { sendEvidence, verificarArchivo } from "../../services/evidence";
import InspectionTabs from "../../components/InspectionTabs";
import { Modal } from "react-bootstrap";
import Icono from "../../assets/icon-vehiculos.png";
import Chulo from '../../assets/chulo-verde.png'
import { FaUserCheck } from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";
import { createRecord, deleteRecord } from "../../services/preOperationalService";
import { BsHandThumbsDownFill, BsHandThumbsUpFill } from "react-icons/bs";
import BinaryQuestionsForm from "../../components/BinaryQuestionsForm";
import { findAgencies } from "../../services/agencyService";
import FileUploadCard from "../../components/FileUploadCard";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdArrowRoundForward } from "react-icons/io";
import { config } from "../../config";
import { FaSave } from "react-icons/fa";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import "./styles.css";

export default function Drivers() {
  const { user, setUser } = useContext(AuthContext);
  const { id } = useParams();
  const [agencias, setAgencias] = useState({});
  const [loading, setLoading] = useState(false);
  const refCo = useRef();
  const refType1 = useRef();
  const refType2 = useState(null);
  const navigate = useNavigate();
  const colors = { primary: "#198754", border: "#dee2e6" }

  const [search, setSearch] = useState({
    id: "",
    nombre: "",
    type1: "",
    vencimiento1: "",
    type2: "",
    vencimiento2:'',
    co: '',
    createdAt: '',
  });

  const [documents, setDocuments] = useState({
    cedula: null,
    licencia1: null,
    licencia2: null,
  });

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    
    // Extraemos únicamente año, mes y día de la cadena original
    const dateOnly = isoString.split("T")[0]; // "2000-01-01"
    return dateOnly;
  };

  useEffect(()=>{
    if(id){
      findOneDriver(id)
      .then(({data})=>{
        setSearch({
          id: data.rowId || "",
          nombre: data.name || "",
          type1: data.typeLicense1 || "",
          vencimiento1: formatDateForInput(data.fechaVencimiento1),
          type2: data.typeLicense2 || "",
          vencimiento2: formatDateForInput(data.fechaVencimiento2),
          co: data.co || "",
          createdAt: data.createdAt || '',
        })
      })
    }
    findAgencies().then(({data})=> setAgencias(data));
  },[]);

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };

  const handleFileChange = (key, file) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemoveFile = (key) => {
    setDocuments((prev) => ({ ...prev, [key]: null }));
  };

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };

    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener("resize", handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto

    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSaveDriver= (e) => {
    e.preventDefault();
    if(search.id && search.nombre &&
      search.co && search.type1 &&
      search.vencimiento1
    ){
      setLoading(true)
      Swal.fire({
        title: 'Subiendo información',
        text: `Por favor, espera mientras se guarda la información en nuestra base de datos...`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading(); 
        }
      });
      const body = {
        rowId: search.id,
        name: search.nombre,
        typeLicense1: search.type1,
        fechaVencimiento1: new Date(search.vencimiento1),
        typeLicense2: search.type2,
        fechaVencimiento2: (search.vencimiento2 !== '' && search.vencimiento2 !== null) ? new Date(search.vencimiento2) : null,
        co: search.co,
        createdAt: new Date(),
        createdBy: user.username,
      }
      createDriver(body)
      .then(({data})=>{
        setLoading(false);
        Swal.fire({
          title: "¡Creación exitosa!",
          text: "Se ha registrado la información satisfactoriamente.",
          imageUrl: Chulo,
          imageWidth: 100,
          customClass: {
            image: "mb-0 mt-3 pb-0",
            title: "mt-1 pt-0",
          },
          confirmButtonText: "Aceptar",
        }).then(() => {
          setSearch({})
          navigate('/administracion')
        });
      })
    }else{
      Swal.fire({
        icon: 'warning',
        title:'¡ATENCIÓN!',
        text:'Para hacer el registro de un conductor nuevo debes llenar todos los cambios y especificar por lo menos 1 tipo de licencia de conducción con su respectiva fecha de vencimiento.',
        showConfirmButton: true,
        confirmButtonColor: 'green'
      })
    }
  }

  const handleUpdateDriver= (e) => {
    e.preventDefault();
    if(search.id && search.nombre &&
      search.co && search.type1 &&
      search.vencimiento1 && id
    ){
      setLoading(true)
      Swal.fire({
        title: 'Subiendo información',
        text: `Por favor, espera mientras se guarda la información en nuestra base de datos...`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading(); 
        }
      });
      const body = {
        rowId: search.id,
        name: search.nombre,
        typeLicense1: search.type1,
        fechaVencimiento1: new Date(search.vencimiento1),
        typeLicense2: search.type2,
        fechaVencimiento2: search.vencimiento2 ? new Date(search.vencimiento2) : '',
        co: search.co,
        updatedAt: new Date(),
        updatedBy: user.username,
      }
      updateDriver(id, body)
      .then(({data})=>{
        setLoading(false);
        Swal.fire({
          title: "¡Actualización exitosa!",
          text: "Se ha actualizado la información satisfactoriamente.",
          imageUrl: Chulo,
          imageWidth: 100,
          customClass: {
            image: "mb-0 mt-3 pb-0",
            title: "mt-1 pt-0",
          },
          confirmButtonText: "Aceptar",
        }).then(() => {
          setSearch({})
          navigate('/administracion')
        });
      })
    }else{
      Swal.fire({
        icon: 'warning',
        title:'¡ATENCIÓN!',
        text:'Para hacer la actualización de un conductor nuevo debes llenar todos los cambios y especificar por lo menos 1 tipo de licencia de conducción con su respectiva fecha de vencimiento.',
        showConfirmButton: true,
        confirmButtonColor: 'green'
      })
    }
  }

  const refreshForm = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se descartará todo el proceso que lleva",
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setSearch({})
        navigate('/administracion')
      }
    });
  };

  return (
    <div
      className={`${isMobile ? 'w-100 py-4 mt-4':'container py-2 mt-5'} d-flex flex-column w-100`}
      style={{ fontSize: 10.5 }}
    >
      <div className={`bg-light rounded shadow-sm ${isMobile ? 'p-2 m-0' : 'p-3'} mb-3`}>
        <div className="d-flex flex-column gap-1">
          <h1 className="text-center fs-6 fw-bold text-success">
            Formulario para {id ? 'actualizar' : 'agregar'} un Conductor
          </h1>
          <div className="mb-2" style={{fontSize: 12}}>
            {/* informacion a diligenciar */}
            <div className={`row row-cols-sm-2 ${isMobile && 'gap-2'}`}>
              <div className={`${!isMobile && ''}`}>
                <label className="mb-1">Número de identificación</label>
                <input
                  id="id"
                  value={search.id}
                  type="number"
                  placeholder="Eje: 1XXXXXXXXX"
                  className="form-control form-control-sm"
                  onChange={(e)=> handlerChangeSearch(e)}
                  style={{textTransform: 'uppercase'}}
                  required
                />
              </div>
              <div className={`${!isMobile && ''}`}>
                <label className="mb-1">Nombre Completo</label>
                <input
                  id="nombre"
                  value={search.nombre}
                  type="text"
                  placeholder="NOMBRES Y APELLIDOS"
                  className="form-control form-control-sm"
                  onChange={(e)=> handlerChangeSearch(e)}
                  style={{textTransform: 'uppercase'}}
                  required
                />
              </div>
              <div className={`${!isMobile && ''}`}>
                <label className="mt-2 mb-1">C.O.</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <select
                    ref={refCo}
                    id="co"
                    className="form-select form-select-sm"
                    value={search.co}
                    onChange={(e)=>setSearch({...search, co: e.target.value})}
                    required
                  >
                    <option value="" selected disabled>
                      -- SELECCIONE UN C.O. --
                    </option>
                    {agencias.length > 0 && agencias
                      ?.sort((a,b)=>a.id - b.id)
                      ?.map((elem) => (
                        <option key={elem.id} value={elem.rowId}>
                          {elem.rowId} - {elem.description}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              {id ?
                <div>
                  <label className="mt-2 mb-1">Fecha Creación</label>
                  <div className={`d-flex align-items-center position-relative w-100`}>
                    <input
                      id="createdAt"
                      type="date"
                      value={search?.createdAt && new Date(search?.createdAt).toISOString().split("T")[0]}
                      className="form-control form-control-sm"
                      required
                      disabled
                    />
                  </div>
                </div>
                :
                <div>
                  <label className="mt-2 mb-1">Fecha Creación</label>
                  <div className={`d-flex align-items-center position-relative w-100`}>
                    <input
                      id="createdAt"
                      type="date"
                      value={new Date().toISOString().split("T")[0]}
                      className="form-control form-control-sm"
                      required
                      disabled
                    />
                  </div>
                </div>
              }
              <div>
                <label className="mt-2 mb-1">Tipo de licencia 1</label>
                <select
                  ref={refType1}
                  id="type1"
                  className="form-select form-select-sm"
                  value={search.type1}
                  onChange={(e)=>setSearch({...search, type1: e.target.value})}
                  required
                >
                  <option value="" selected disabled>
                    -- SELECCIONE UN TIPO DE LICENCIA --
                  </option>
                  <option value='A2'>A2</option>
                  <option value='C1'>C1</option>
                  <option value='C2'>C2</option>
                </select>
              </div>
              <div>
                <label className="mt-2 mb-1">fecha Vencimiento Licencia 1</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="vencimiento1"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.vencimiento1}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Tipo de licencia 2</label>
                <select
                  ref={refType2}
                  id="type2"
                  className="form-select form-select-sm"
                  value={search.type2}
                  onChange={(e)=>setSearch({...search, type2: e.target.value})}
                  required
                >
                  <option value="" selected disabled>
                    -- SELECCIONE UN TIPO DE LICENCIA --
                  </option>
                  <option value='A2'>A2</option>
                  <option value='C1'>C1</option>
                  <option value='C2'>C2</option>
                </select>
              </div>
              <div>
                <label className="mt-2 mb-1">fecha Vencimiento Licencia 2</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="vencimiento2"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.vencimiento2}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <hr className="my-1" /> 
          <h1 className="text-start fs-6 fw-bold text-success">
            DOCUMENTOS OBLIGATORIOS
          </h1>
          <span 
            className="form-label fw-semibold text-secondary mb-1 d-flex justify-content-center w-100 align-text-center"
            style={{fontSize: 14}}
          >Pronto estará disponible esta sesión</span>
          {/* <div className="mb-2" style={{fontSize: 12}}>
            <div className={`row row-cols-sm-3 ${isMobile && 'gap-2'}`}>
              <FileUploadCard
                label="Cédula de Ciudadanía"
                description="PDF (Ambas caras)"
                file={documents.cedula}
                onFileSelect={(file) => handleFileChange('cedula', file)}
                onRemoveFile={() => handleRemoveFile('cedula')}
                colors={colors}
              />

              <FileUploadCard
                label="Licencia de Tránsito 1"
                description="PDF (Ambas caras)"
                file={documents.licencia1}
                onFileSelect={(file) => handleFileChange('licencia1', file)}
                onRemoveFile={() => handleRemoveFile('licencia1')}
                colors={colors}
              />

              <FileUploadCard
                label="Licencia de Tránsito 2"
                description="PDF (Ambas caras)"
                file={documents.licencia2}
                onFileSelect={(file) => handleFileChange('licencia2', file)}
                onRemoveFile={() => handleRemoveFile('licencia2')}
                colors={colors}
              />
            </div>
          </div> */}
          <div className="d-flex flex-row gap-3 pt-2 pb-2">
            <button
              type="button"
              className="btn btn-sm btn-danger fw-bold w-100"
              onClick={refreshForm}
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-success fw-bold w-100"
              onClick={(e) => id ? handleUpdateDriver(e) : handleSaveDriver(e)}
            >
              {id ? 'Actualizar' : 'Guardar'} 
              <FaSave className="ms-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}