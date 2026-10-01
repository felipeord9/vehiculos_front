import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findBycedula, findDrivers } from '../../services/driverService';
import { sendMail, sendMail2, sendMailNews, sendMailNotCondition } from "../../services/mailService";
import AuthContext from "../../context/authContext";
import { createVehicle, findOneVehicle, findVehicles, updateVehicle } from '../../services/vehicleService'
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
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdArrowRoundForward } from "react-icons/io";
import { config } from "../../config";
import { FaSave } from "react-icons/fa";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import "./styles.css";
import { findAgencies } from "../../services/agencyService";
import FileUploadCard from "../../components/FileUploadCard";

export default function Vehicles() {
  const { user, setUser } = useContext(AuthContext);
  const { id } = useParams();
  const [agencias, setAgencias] = useState({});
  const refCo = useRef();
  const [loading, setLoading] = useState(false);
  const refTypeVehicle = useState(null);
  const navigate = useNavigate();
  const colors = { primary: "#dc3545", border: "#dee2e6" }

  const [search, setSearch] = useState({
    plate: "",
    typeVehicle: "",
    brand: "",
    chip: "",
    soat: "",
    tecno:'',
    kilometraje: '',
    lastMaintenance: '',
    saneamientoCarnico: '',
    saneamientoPesquero: '',
    fumigacion: '',
    invima: '',
    co: '',
    poliza:'',
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
      findOneVehicle(id)
      .then(({data})=>{
        setSearch({
          plate: data.plate,
          typeVehicle: data.typeVehicle,
          brand: data.brand,
          chip: data.chip,
          soat: formatDateForInput(data.soat),
          tecno: formatDateForInput(data.tecno),
          kilometraje: data.km,
          lastMaintenance: formatDateForInput(data.lastMaintenance),
          saneamientoCarnico: formatDateForInput(data.saneamientoCarnico),
          saneamientoPesquero: formatDateForInput(data.saneamientoPesquero),
          fumigacion: formatDateForInput(data.fumigacion),
          invima: formatDateForInput(data.invima),
          co: data.co,
          poliza: formatDateForInput(data.poliza),
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

  const handleSaveVehicle= (e) => {
    e.preventDefault();
    if(search.plate && search.typeVehicle &&
      search.co && search.brand &&
      search.chip && search.soat &&
      search.tecno && search.kilometraje &&
      search.lastMaintenance && search.saneamientoCarnico &&
      search.saneamientoPesquero && search.fumigacion &&
      search.invima && search.poliza
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
        plate: search.plate,
        typeVehicle: search.typeVehicle,
        co: search.co,
        brand: search.brand,
        chip: search.chip,
        soat: new Date(search.soat),
        tecno: new Date(search.tecno),
        km: search.kilometraje,
        lastMaintenance: new Date(search.lastMaintenance),
        saneamientoCarnico: new Date(search.saneamientoCarnico),
        saneamientoPesquero: new Date(search.saneamientoPesquero),
        fumigacion: new Date(search.fumigacion),
        poliza: new Date(search.poliza),
        invima: new Date(search.invima),
        createdAt: new Date(),
        createdBy: user.username,
      }
      createVehicle(body)
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
        text:'Para hacer el registro de un vehículo nuevo debes llenar todos los cambios.',
        showConfirmButton: true,
        confirmButtonColor: 'green'
      })
    }
  }

  const handleUpdateVehicle= (e) => {
    e.preventDefault();
    if(search.plate && search.typeVehicle &&
      search.co && search.brand &&
      search.chip && search.soat &&
      search.tecno && search.kilometraje &&
      search.lastMaintenance && search.saneamientoCarnico &&
      search.saneamientoPesquero && search.fumigacion &&
      search.invima && search.poliza
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
        plate: search.plate,
        typeVehicle: search.typeVehicle,
        co: search.co,
        brand: search.brand,
        chip: search.chip,
        soat: new Date(search.soat),
        tecno: new Date(search.tecno),
        km: search.kilometraje,
        lastMaintenance: new Date(search.lastMaintenance),
        saneamientoCarnico: new Date(search.saneamientoCarnico),
        saneamientoPesquero: new Date(search.saneamientoPesquero),
        fumigacion: new Date(search.fumigacion),
        poliza: new Date(search.poliza),
        invima: new Date(search.invima),
        UpdatedAt: new Date(),
        UpdatedBy: user.username,
      }
      updateVehicle(id, body)
      .then(({data})=>{
        setLoading(false);
        Swal.fire({
          title: "¡Actualización exitosa!",
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
        text:'Para hacer la actualización de un vehículo nuevo debes llenar todos los cambios.',
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
          <h1 className="text-center fs-6 fw-bold" style={{color:'#f36d5e'}}>
            Formulario para {id ? 'actualizar' : 'agregar'} un Vehículo
          </h1>
          <div className="mb-2" style={{fontSize: 12}}>
            {/* informacion a diligenciar */}
            <div className={`row row-cols-sm-3 ${isMobile && 'gap-2'}`}>
              <div className={`${!isMobile && ''}`}>
                <label className="mb-1">Placa</label>
                <input
                  id="plate"
                  value={search.plate}
                  type="text"
                  placeholder="Eje: AAA111"
                  className="form-control form-control-sm"
                  onChange={(e)=> handlerChangeSearch(e)}
                  style={{textTransform: 'uppercase'}}
                  required
                />
              </div>
              <div className={`${!isMobile && ''}`}>
                <label className="mb-1">Tipo de vehículo</label>
                <select
                  ref={refTypeVehicle}
                  id="refTypeVehicle"
                  className="form-select form-select-sm"
                  value={search.typeVehicle}
                  onChange={(e)=>setSearch({...search, typeVehicle: e.target.value})}
                  required
                >
                  <option value="" selected disabled>
                    -- SELECCIONE UN TIPO DE VEHICULO --
                  </option>
                  <option value='MOTO'>MOTO</option>
                  <option value='MOTOCARGUERO'>MOTOCARGUERO</option>
                  <option value='CAMION'>CAMION</option>
                </select>
              </div>
              <div className={`${!isMobile && ''}`}>
                <label className="mb-1">C.O.</label>
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
              <div>
                <label className="mt-2 mb-1">Marca</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="brand"
                    type="text"
                    className="form-control form-control-sm"
                    value={search.brand}
                    placeholder="Eje: MAZDA"
                    onChange={(e)=> handlerChangeSearch(e)}
                    style={{textTransform: 'uppercase'}}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Chip</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="chip"
                    type="text"
                    className="form-control form-control-sm"
                    value={search.chip}
                    onChange={(e)=> handlerChangeSearch(e)}
                    placeholder="Eje: 1XXXXXXX"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">fecha Vencimiento SOAT</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="soat"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.soat}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">fecha Vencimiento Tecno-mecánica</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="tecno"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.tecno}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Kilometráje</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="kilometraje"
                    type="number"
                    className="form-control form-control-sm"
                    value={search.kilometraje}
                    placeholder="Eje: 1XXXXX"
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Último mantenimiento</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="lastMaintenance"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.lastMaintenance}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Saneamiento Carnico</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="saneamientoCarnico"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.saneamientoCarnico}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Saneamiento Pesquero</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="saneamientoPesquero"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.saneamientoPesquero}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Fumigación</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="fumigacion"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.fumigacion}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Invima</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="invima"
                    type="date"
                    className="form-control form-control-sm"
                    value={search.invima}
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mt-2 mb-1">Póliza</label>
                <div className={`d-flex align-items-center position-relative w-100`}>
                  <input
                    id="poliza"
                    type="date"
                    value={search.poliza}
                    className="form-control form-control-sm"
                    onChange={(e)=> handlerChangeSearch(e)}
                    required
                  />
                </div>
              </div>
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
            </div>
          </div>
          <hr className="my-1" /> 
          <h1 className="text-start fs-6 fw-bold" style={{color:'#f36d5e'}}>
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
              onClick={(e) => id ? handleUpdateVehicle(e) : handleSaveVehicle(e)}
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