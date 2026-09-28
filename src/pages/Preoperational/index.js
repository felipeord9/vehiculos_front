import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { findBycedula, findDrivers } from '../../services/driverService';
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
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdArrowRoundForward } from "react-icons/io";
import { config } from "../../config";
import { FaSave } from "react-icons/fa";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import "./styles.css";

export default function Preoperational() {
  const { user, setUser } = useContext(AuthContext);
  const [typeEvidence, setTypeEvidence] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  
  /* Formulario informacion */
  const [drivers, setDrivers] = useState([]);
  const [plates, setPlates] = useState([]);
  const [driverSeleccionado, setDriverSeleccionado] = useState(null);
  const [platesSeleccionado, setPlateSeleccionado] = useState(null);
  const [suggestionsDriver, setSuggestionsDriver] = useState([]);
  const [suggestionsPlates, setSuggestionsPlate] = useState([]);
  const [tap2Enable, setTap2Enable] = useState(false);
  const [tap3Enable, setTap3Enable] = useState(false);
  const [health, setHealth] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const refDriver = useRef();
  const refPlate = useRef();
  const refHealth = useRef();
  const { id } = useParams();

  /* Formulario verificacion */
  const [dataVerification, setDataVerification] = useState({});
  const [newsToSend, setNewsToSend] = useState({});

  /* Formulario de fallas */
  const [tieneFalla, setTieneFalla] = useState('');

  useEffect(()=>{
    findDrivers().then(({data}) => (setDrivers(data), setSuggestionsDriver(data)));
    findVehicles().then(({data}) => (setPlates(data), setSuggestionsPlate(data)));
  },[])

  const [search, setSearch] = useState({
    idDriver: "",
    name: "",
    plate: "",
    observations: "",
    order: "",
    createdAt:'',
  });

  const [info, setInfo] = useState({})

  const [loading, setLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState(false);
  const selectBranchRef = useRef();
  const [factura, setFactura] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const webcamRef = useRef(null);
  const ImgFirmaRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // Foto en previsualización

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

  // Formatear tiempo como mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  
  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };
  
  //manejador de funciones para drivers
  //encontrar driver por cedula
  const findById = (e) => {
    const { value } = e.target;
    const item = drivers.find((elem) => parseInt(elem.rowId) === parseInt(value));

    if (item) {
      setDriverSeleccionado(item);
    } else {
      setDriverSeleccionado(null);
    }
  };
  //manejador del input para el driver
  const handlerChangeDriver = (e) => {
    const { value } = e.target;
    setDriverSeleccionado(null);
    if (value !== "" && value !== null) {
      const filter = drivers.filter((elem) =>
        elem.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestionsDriver(filter);
    } else {
      setSuggestionsDriver(drivers);
    }
    refDriver.current.selectedIndex = 0;
    setSearch({
      ...search,
      name: value
    })
  };
  //funcion para buscar producto por descripcion cuando lo seleccionen en el select
  const findDriverByDescrip = (e) => {
    const { value } = e.target;
    const item = drivers.find((elem)=> elem.name.toLowerCase() === value.toLowerCase());
    if(item){
      setDriverSeleccionado(item)
    }else{
      setDriverSeleccionado(null)
    }
  }

  //manejador de funciones para placas
  //manejador del input para el driver
  const handlerChangePlate = (e) => {
    const { value } = e.target;
    setPlateSeleccionado(null);
    if (value !== "" && value !== null) {
      const filter = plates.filter((elem) =>
        elem.plate.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestionsPlate(filter);
    } else {
      setSuggestionsPlate(plates);
    }
    refPlate.current.selectedIndex = 0;
    setSearch({
      ...search,
      plate: value
    })
  };
  //funcion para buscar producto por descripcion cuando lo seleccionen en el select
  const findPlaterByDescrip = (e) => {
    const { value } = e.target;
    const item = plates.find((elem)=> elem.plate.toLowerCase() === value.toLowerCase());
    if(item){
      setPlateSeleccionado(item)
    }else{
      setPlateSeleccionado(null)
    }
  }

  // 1. Función Helper para convertir DataURL (Base64) a File
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let canvas, ctx;
    let isDrawing = false;
    let hasSigned = false; // Controla si realmente firmó algo

    Swal.fire({
      title: "Firma Digital Requerida",
      html: `
        <p class="text-muted small mb-2">Por favor, firme dentro del recuadro antes de guardar la información.</p>
        <div style="border: 2px dashed #ccc; border-radius: 8px; background: #fafafa; display: inline-block; position: relative;">
          <canvas id="signature-canvas" width="350" height="150" style="touch-action: none; cursor: crosshair;"></canvas>
        </div>
        <div class="mt-2">
          <button type="button" id="clear-signature-btn" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-eraser"></i> Limpiar firma
          </button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar con Firma",
      confirmButtonColor: "#198754",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        // Inicializar el Canvas de Firma al abrir SweetAlert
        canvas = document.getElementById("signature-canvas");
        ctx = canvas.getContext("2d");
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.lineCap = "round";

        // Obtener coordenadas ajustadas
        const getPos = (e) => {
          const rect = canvas.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          return {
            x: clientX - rect.left,
            y: clientY - rect.top,
          };
        };

        const startDrawing = (e) => {
          isDrawing = true;
          hasSigned = true;
          const pos = getPos(e);
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
        };

        const draw = (e) => {
          if (!isDrawing) return;
          const pos = getPos(e);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        };

        const stopDrawing = () => {
          isDrawing = false;
        };

        // Eventos Mouse
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mouseleave", stopDrawing);

        // Eventos Táctiles (Móviles / Tablets)
        canvas.addEventListener("touchstart", startDrawing);
        canvas.addEventListener("touchmove", draw);
        canvas.addEventListener("touchend", stopDrawing);

        // Botón Limpiar
        document.getElementById("clear-signature-btn").addEventListener("click", () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          hasSigned = false;
        });
      },
      preConfirm: () => {
        if (!hasSigned) {
          Swal.showValidationMessage("Es obligatorio firmar antes de guardar.");
          return false;
        }
        // Retornar la firma convertida a Base64
        return canvas.toDataURL("image/png");
      },
    }).then(({ isConfirmed, value: signatureBase64 }) => {
      if (isConfirmed && signatureBase64) {
        setLoading(true);

        // 2. Convertimos el Base64 a un objeto File
        const firmaFile = dataURLtoFile(signatureBase64, "firmaConductor.png");

        var body = {
          platesSeleccionado,
          driverSeleccionado,
          health,
          dataVerification,
          tieneFalla,
          resumen: search.observations,
          evidencia: evidence ? true : false,
          createdBy: user.username,
          firmaConductor: true,
        };

        // 3. Primero creamos el registro base
        createRecord(body)
          .then(({ data }) => {
            // 4. Preparamos el FormData con los archivos adjuntos
            const f = new FormData();
            f.append("id", data.id);
            f.append("info", JSON.stringify(body));

            // 🎯 Agregamos la firma en formato de archivo
            f.append("firmaConductor", firmaFile, "firmaConductor.png");

            // Si hay video o archivo de evidencia adicional
            if (evidence) {
              f.append("evidence", evidence, "evidence.webm");
            }

            // Enviamos los archivos multimedia al servidor
            sendEvidence(f)
              .then(() => {
                if(newsToSend.length > 0){
                  const info = {
                    novedades: newsToSend,
                    infoDriver: data
                  }
                  sendMailNews(info)
                    .then(()=>{
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
                        window.location.reload();
                      });
                    })
                    //igual debemos decir que se hizo porque esto no puedo interrumpir el programa
                    .catch(()=>{
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
                        window.location.reload();
                      });
                    })
                }else{
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
                    window.location.reload();
                  });
                }
              })
              .catch(() => {
                setLoading(false);
                deleteRecord(data.id);
                Swal.fire({
                  title: "¡Ha ocurrido un error!",
                  text: "Hubo un error al momento de guardar la evidencia/firma del registro, intente de nuevo. Si el problema persiste por favor comuníquese con el área de sistemas.",
                  icon: "warning",
                  confirmButtonText: "Aceptar",
                });
              });
          })
          .catch((err) => {
            setLoading(false);
            Swal.fire({
              title: "¡Ha ocurrido un error!",
              text: "Hubo un error al momento de registrar la información, intente de nuevo. Si el problema persiste por favor comuníquese con el área de sistemas.",
              icon: "warning",
              confirmButtonText: "Aceptar",
            });
          });
      }
    });
  };

  const previewSubmit = (e) => {
    e.preventDefault();
    if (
      platesSeleccionado &&
      driverSeleccionado &&
      health !== null &&
      health !== '' &&
      health === 'CON LIMITACIÓN DE SALUD' &&
      diagnosis !== null &&
      diagnosis !== ''
    ) {
      let canvas, ctx;
      let isDrawing = false;
      let hasSigned = false;

      Swal.fire({
        title: "Firma Digital Requerida",
        html: `
          <p class="text-muted small mb-2">Por favor, firme dentro del recuadro antes de guardar la información.</p>
          <div style="border: 2px dashed #ccc; border-radius: 8px; background: #fafafa; display: inline-block; position: relative;">
            <canvas id="signature-canvas" width="350" height="150" style="touch-action: none; cursor: crosshair;"></canvas>
          </div>
          <div class="mt-2">
            <button type="button" id="clear-signature-btn" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-eraser"></i> Limpiar firma
            </button>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar con Firma",
        confirmButtonColor: "#198754",
        cancelButtonText: "Cancelar",
        didOpen: () => {
          canvas = document.getElementById("signature-canvas");
          ctx = canvas.getContext("2d");
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#000000";
          ctx.lineCap = "round";

          const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
              x: clientX - rect.left,
              y: clientY - rect.top,
            };
          };

          const startDrawing = (e) => {
            isDrawing = true;
            hasSigned = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
          };

          const draw = (e) => {
            if (!isDrawing) return;
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
          };

          const stopDrawing = () => {
            isDrawing = false;
          };

          // Eventos Mouse
          canvas.addEventListener("mousedown", startDrawing);
          canvas.addEventListener("mousemove", draw);
          canvas.addEventListener("mouseup", stopDrawing);
          canvas.addEventListener("mouseleave", stopDrawing);

          // Eventos Táctiles
          canvas.addEventListener("touchstart", startDrawing);
          canvas.addEventListener("touchmove", draw);
          canvas.addEventListener("touchend", stopDrawing);

          // Botón Limpiar
          document.getElementById("clear-signature-btn").addEventListener("click", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasSigned = false;
          });
        },
        preConfirm: () => {
          if (!hasSigned) {
            Swal.showValidationMessage("Es obligatorio firmar antes de guardar.");
            return false;
          }
          return canvas.toDataURL("image/png");
        },
      }).then(({ isConfirmed, value: signatureBase64 }) => {
        if (isConfirmed && signatureBase64) {
          setLoading(true);

          // Convertir firma a archivo
          const firmaFile = dataURLtoFile(signatureBase64, "firmaConductor.png");

          var body = {
            platesSeleccionado,
            driverSeleccionado,
            health,
            diagnosis,
            createdBy: user.username,
            firmaConductor: true,
          };

          // 1. Guardar el registro inicial
          createRecord(body)
            .then(({ data }) => {
              // 2. Preparar el FormData para enviar la firma
              const f = new FormData();
              f.append("id", data.id);
              f.append("info", JSON.stringify(body));
              f.append("firmaConductor", firmaFile, "firmaConductor.png");

              // 3. Subir el archivo al servidor
              sendEvidence(f)
                .then(() => {
                  sendMailNotCondition(data)
                  .then(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "¡Creación exitosa!",
                      text: "Se ha registrado la información satisfactoriamente.",
                      imageUrl: Chulo,
                      imageWidth: 100,
                      customClass: {
                        image: 'mb-0 mt-3 pb-0',
                        title: 'mt-1 pt-0'
                      },
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      window.location.reload();
                    });
                  })
                  .catch(()=>{
                    // igual debe aparecer bien porque esto no puede frenar la operacion
                    setLoading(false);
                    alert('ERROR al enviar el correo')
                    Swal.fire({
                      title: "¡Creación exitosa!",
                      text: "Se ha registrado la información satisfactoriamente.",
                      imageUrl: Chulo,
                      imageWidth: 100,
                      customClass: {
                        image: 'mb-0 mt-3 pb-0',
                        title: 'mt-1 pt-0'
                      },
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      window.location.reload();
                    });
                  })
                })
                .catch(() => {
                  setLoading(false);
                  deleteRecord(data.id);
                  Swal.fire({
                    title: "¡Ha ocurrido un error!",
                    text: "Hubo un error al momento de guardar la firma del registro, intente de nuevo. Si el problema persiste por favor comuníquese con el área de sistemas.",
                    icon: "warning",
                    confirmButtonText: "Aceptar",
                  });
                });
            })
            .catch((err) => {
              setLoading(false);
              Swal.fire({
                title: "¡Ha ocurrido un error!",
                text: "Hubo un error al momento de registrar la información, intente de nuevo. Si el problema persiste por favor comuníquese con el área de sistemas.",
                icon: "warning",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Para poder continuar debes llenar todos los campos',
        timer: 50000,
        showConfirmButton: false
      });
    }
  };

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
      if (isConfirmed) window.location.reload();
    });
  };

  /* Logica para tomar la foto de evidencia */
  //se agrega toda esta parte
  const camaraRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const startCamera = async () => {
    try {
      const backStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false,
      });
      setStream(backStream);
      if (camaraRef.current) {
        camaraRef.current.srcObject = backStream;
      }
    } catch (err) {
      alert("❌ Cámara trasera no disponible. Probando cámara frontal...");
      try {
        const frontStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        setStream(frontStream);
        if (camaraRef.current) {
          camaraRef.current.srcObject = frontStream;
        }
      } catch (fallbackErr) {
        console.error("❌ No se pudo acceder a ninguna cámara:", fallbackErr);
        setError("No se encontró ninguna cámara en el dispositivo.");
      }
    }
  };
  //

  // Abrir el modal para un campo específico
  const openModal = (e) => {
    setShowModal(true);
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Cerrar el modal
  const closeModal = (e) => {
    setShowModal(false);

    /* Se agrega esta parte */
    // 🔴 Detener la cámara después de capturar la imagen
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (camaraRef.current) {
      camaraRef.current.srcObject = null;
    }
    /*  */
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Capturar la foto y guardarla en el estado correspondiente
  const capturePhoto = () => {
    const video = camaraRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && canvas.getContext) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewPhoto(dataUrl);

      // 🔴 Detener la cámara después de capturar la imagen
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  //descartar foto en el modal
  const discardPhoto = () => {
    setPreviewPhoto(null); // Mostrar previsualización
    setFactura(null);
    startCamera();
  };
  // Guardar la foto en el estado correspondiente
  const savePhoto = async () => {
    const response = await fetch(previewPhoto);
    const imageBlob = await response.blob();
    setFactura(imageBlob);
    closeModal();
  };
  // Subir una imagen desde el dispositivo
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target.result); // Mostrar previsualización
      };
      reader.readAsDataURL(file);
    }
  };

  /* logica para cuando es video */
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        /* width: { ideal : '100%' },
        height: { ideal : '100%' }  */
      },
      audio: true,
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setElapsedTime(0);

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    clearInterval(timerInterval);
    setRecording(false);
  };

  const uploadVideo = async (e) => {
    e.preventDefault();
    const video = new Blob(recordedChunks.current, { type: "video/webm" });
    setEvidence(video);
    closeModal();
  };

  const continuePage = (e) => {
    if(activeTab === 1){
      if(platesSeleccionado && driverSeleccionado && 
        health !== null && health !== ''
      ){
        if(health === 'SIN LIMITACIÓN DE SALUD'){
          setActiveTab(2)
          setTap2Enable(true)
        }
      }else{
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          text: 'Para poder continuar debes llenar todos los campos',
          timer: 50000,
          showConfirmButton: false
        })
      }
    }
    if(activeTab === 2){
      if(platesSeleccionado && driverSeleccionado && 
        health !== null && health !== '' &&
        dataVerification.ultimoKilometraje && dataVerification.portaLicenciaConduccion &&
        dataVerification.portaLicenciaTransito && dataVerification.portaSOAT &&
        dataVerification.portaTecnicoMecanica && dataVerification.portaCedula &&
        dataVerification.aceiteMotor && dataVerification.liquidoFrenos &&
        dataVerification.nivelCombustible && dataVerification.liquidoRefrigerante &&
        dataVerification.estadoLlantas && dataVerification.lucesPrincipales &&
        dataVerification.lucesDireccionales && dataVerification.lucesStop &&
        dataVerification.frenosGeneral && dataVerification.ManiguetaFreno &&
        dataVerification.casco && dataVerification.calzado &&
        dataVerification.chaleco && dataVerification.impermeable &&
        dataVerification.guardabarros && dataVerification.sillin &&
        dataVerification.Reposapies && dataVerification.Espejos &&
        dataVerification.Pito && dataVerification.cadena &&
        dataVerification.pata && dataVerification.protectorExhosto &&
        dataVerification.maletin && dataVerification.velocimetro &&
        dataVerification.placa && dataVerification.clutch
      ){
        setActiveTab(3)
        setTap3Enable(true)
      }else{
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          text: 'Para poder continuar debes llenar todos los campos',
          timer: 50000,
          showConfirmButton: false
        })
      }
    }
    if(activeTab === 3){
      if(platesSeleccionado && driverSeleccionado && 
        health !== null && health !== '' &&
        dataVerification.ultimoKilometraje && dataVerification.portaLicenciaConduccion &&
        dataVerification.portaLicenciaTransito && dataVerification.portaSOAT &&
        dataVerification.portaTecnicoMecanica && dataVerification.portaCedula &&
        dataVerification.aceiteMotor && dataVerification.liquidoFrenos &&
        dataVerification.nivelCombustible && dataVerification.liquidoRefrigerante &&
        dataVerification.estadoLlantas && dataVerification.lucesPrincipales &&
        dataVerification.lucesDireccionales && dataVerification.lucesStop &&
        dataVerification.frenosGeneral && dataVerification.ManiguetaFreno &&
        dataVerification.casco && dataVerification.calzado &&
        dataVerification.chaleco && dataVerification.impermeable &&
        dataVerification.guardabarros && dataVerification.sillin &&
        dataVerification.Reposapies && dataVerification.Espejos &&
        dataVerification.Pito && dataVerification.cadena &&
        dataVerification.pata && dataVerification.protectorExhosto &&
        dataVerification.maletin && dataVerification.velocimetro &&
        dataVerification.placa && dataVerification.clutch &&
        tieneFalla !== null && tieneFalla !== ''
      ){
        if(tieneFalla === 'SI'){
          if(search.observations !== '' && search.observations !== null &&
            evidence !== null
          ){
            handleSubmit(e)
          } else {
            Swal.fire({
              icon: 'warning',
              title: '¡Atención!',
              text: 'Debes especificar la falla y tomar evidencia.',
              timer: 50000,
              showConfirmButton: false
            })
          }
        } else if(tieneFalla === 'NO')  {
          handleSubmit(e)
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          text: 'Para poder continuar debes llenar todos los campos',
          timer: 50000,
          showConfirmButton: false
        })
      }
    }
  }

  return (
    <div
      className={`${isMobile ? 'w-100 py-4 mt-4':'container py-2 mt-5'} d-flex flex-column w-100`}
      style={{ fontSize: 10.5 }}
    >
      {/* Header */}
      {!isMobile && <InspectionTabs currentTab={activeTab} setTab={setActiveTab} tap1Enable={true} tap2Enable={tap2Enable} tap3Enable={tap3Enable} />}

      {/* <form className="" onSubmit={(e)=>handleSubmit(e)}> */}
      <div className={`bg-light rounded shadow-sm ${isMobile ? 'p-2 m-0' : 'p-3'} mb-3`}>
        <div className="d-flex flex-column gap-1">
          {(isMobile && activeTab) === 1 ?
            <h1 className="text-center fs-6 fw-bold">
              Información del Vehiculo y Conductor
            </h1>
            : (isMobile && activeTab === 2) ?
              <h1 className="text-center fs-6 fw-bold">
                Verificación del Vehiculo
              </h1>
              : (isMobile && activeTab === 3) &&
                <h1 className="text-center fs-6 fw-bold">
                  Reportar Fallas
                </h1>
          }
          {isMobile &&
            <hr className="my-1" />
          }

          {/* info vehiculo y conductor */}
          {activeTab === 1 &&
            <div>
              <div className="mb-2" style={{fontSize: 12}}>
                {/* informacion a diligenciar */}
                <div className={`row row-cols-sm-2 ${isMobile && 'gap-2'}`}>
                  <div className="d-flex flex-column align-items-start">
                    <label className="mb-2">Placa:</label>
                    <div className={`d-flex align-items-center position-relative w-100`}>
                      <input
                        id="plate"
                        type="search"
                        autoComplete="off"
                        placeholder="Selecciona una placa"
                        value={
                          platesSeleccionado ?
                            platesSeleccionado.plate :
                            search?.plate
                        }
                        onChange={(e)=>handlerChangePlate(e)}
                        className="form-control form-control-sm input-select"
                        style={{textTransform:'uppercase'}}
                      />
                      <select
                        ref={refPlate}
                        id="plate"
                        className="form-select form-select-sm"
                        onChange={(e)=>findPlaterByDescrip(e)}
                        required
                      >
                        <option value="" selected disabled>
                          -- SELECCIONE UNA PLACA --
                        </option>
                        {suggestionsPlates
                          ?.sort((a,b)=>a.id - b.id)
                          .map((elem) => (
                            <option key={elem.id} value={elem.plate}>
                              {elem.plate}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className={`${!isMobile && ''}`}>
                    <label className="mb-2">Tipo de vehículo</label>
                    <input
                      id="typeVehicle"
                      type="text"
                      className="form-control form-control-sm"
                      value={platesSeleccionado && platesSeleccionado.typeVehicle}
                      required
                      disabled
                    />
                  </div>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">No. identificación</label>
                    <input
                      id="idDriver"
                      type="number"
                      placeholder="Eje: 1XXXXXXXXX"
                      className="form-control form-control-sm"
                      value={driverSeleccionado ? driverSeleccionado.rowId : search.idDriver}
                      onChange={(e) => {
                        handlerChangeSearch(e);
                        findById(e)
                      }}
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="mb-2 mt-2">Conductor:</label>
                    <div className={`d-flex align-items-center position-relative w-100`}>
                      <input
                        id="name"
                        type="search"
                        autoComplete="off"
                        placeholder="Selecciona un conductor"
                        value={
                          driverSeleccionado ?
                            driverSeleccionado.name :
                            search?.name
                        }
                        onChange={(e)=>handlerChangeDriver(e)}
                        className="form-control form-control-sm input-select"
                        style={{textTransform:'uppercase'}}
                      />
                      <select
                        ref={refDriver}
                        id="name"
                        className="form-select form-select-sm"
                        onChange={(e)=>findDriverByDescrip(e)}
                        required
                      >
                        <option value="" selected disabled>
                          -- SELECCIONE UN CONDUCTOR --
                        </option>
                        {suggestionsDriver
                          ?.sort((a,b)=>a.id - b.id)
                          .map((elem) => (
                            <option key={elem.id} value={elem.name}>
                              {elem.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">FECHA CREACIÓN SOLICITUD</label>
                    {!id ?
                      <input
                        id="createdAt"
                        type="date"
                        className="form-control form-control-sm"
                        value={new Date().toISOString().split("T")[0]}
                        onChange={handlerChangeSearch}
                        required
                        disabled
                      />
                      :
                      <input
                        id="createdAt"
                        type="text"
                        className="form-control form-control-sm"
                        value={new Date(search.createdAt).toLocaleDateString()}
                        onChange={handlerChangeSearch}
                        required
                        disabled
                      />
                    }
                  </div>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">Estado de Salud:</label>
                    <div className={`d-flex align-items-center position-relative w-100`}>
                      <select
                        ref={refHealth}
                        id="health"
                        className="form-select form-select-sm"
                        value={health}
                        onChange={(e)=>setHealth(e.target.value)}
                        required
                      >
                        <option value="" selected disabled>
                          -- SELECCIONE UN ESTADO DE SALUD --
                        </option>
                        <option className="text-success" value='SIN LIMITACIÓN DE SALUD'>✅ SIN LIMITACIÓN DE SALUD</option>
                        <option className="text-danger" value='CON LIMITACIÓN DE SALUD'>⛑️ CON LIMITACIÓN DE SALUD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {health === 'CON LIMITACIÓN DE SALUD' &&
                  <div className="d-flex flex-column mb-1 mt-2 w-100">
                    <label className="mb-2">Especifique su limitación</label>
                    <textarea
                      id="diagnosis"
                      className="form-control"
                      value={diagnosis}
                      onChange={(e)=> setDiagnosis(e.target.value)}
                      style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
                    ></textarea>
                  </div>
                }

                {/* informacion general */}
                <div className={`row row-cols-sm-2 mt-1 ${isMobile && 'gap-2'}`}>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">Marca</label>
                    <input
                      id="brand"
                      type="text"
                      className="form-control form-control-sm"
                      value={platesSeleccionado && platesSeleccionado.brand}
                      required
                      disabled
                    />
                  </div>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">Agencia</label>
                    <input
                      id="co"
                      type="text"
                      className="form-control form-control-sm"
                      value={platesSeleccionado && platesSeleccionado.co}
                      required
                      disabled
                    />
                  </div>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">Vencimiento SOAT</label>
                    {!platesSeleccionado ?
                      <input
                        id="soat"
                        type="text"
                        value=''
                        className="form-control form-control-sm"
                        required
                        disabled
                      />
                      :
                      <input
                        id="soat"
                        type="text"
                        className="form-control form-control-sm"
                        value={platesSeleccionado.soat ? new Date(platesSeleccionado.soat).toLocaleDateString() : ''}
                        required
                        disabled
                      />
                    }
                  </div>
                  <div className={`${!isMobile && 'mt-2'}`}>
                    <label className="mb-2">Vencimiento Tecno-Mecánica</label>
                    {!platesSeleccionado ?
                      <input
                        id="soat"
                        type="text"
                        className="form-control form-control-sm"
                        required
                        disabled
                      />
                      :
                      <input
                        id="soat"
                        type="text"
                        className="form-control form-control-sm"
                        value={platesSeleccionado.tecno ? new Date(platesSeleccionado.tecno).toLocaleDateString():''}
                        required
                        disabled
                      />
                    }
                  </div>
                </div>
              </div>
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
                  onClick={(e) => health === 'SIN LIMITACIÓN DE SALUD' ? continuePage(e) : previewSubmit(e)}
                >
                  {health === 'SIN LIMITACIÓN DE SALUD' ? 'Siguiente' : 'Guardar'} 
                  {health === 'SIN LIMITACIÓN DE SALUD' ? <IoMdArrowRoundForward className="ms-1"/> : <FaSave className="ms-1" />}
                </button>
              </div>
            </div>
          }

          {/* Verificacion */}
          {activeTab === 2 &&
            <div>
              <div className="mb-2">
                <BinaryQuestionsForm 
                  typeVehicle={platesSeleccionado.typeVehicle}
                  formData={dataVerification}
                  setFormData={setDataVerification}
                  news={newsToSend}
                  setNews={setNewsToSend}
                />
                <div className="d-flex flex-row gap-3 pt-4 pb-1">
                  <button
                    type="submit"
                    className="btn btn-sm btn-secondary fw-bold w-100"
                    onClick={(e) => setActiveTab(1)}
                  >
                    <IoMdArrowRoundBack /> Volver
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-success fw-bold w-100"
                    onClick={(e) => continuePage(e)}
                  >
                    Siguiente <IoMdArrowRoundForward />
                  </button>
                </div>
              </div>
            </div>
          }
          {/* <hr className="my-1" /> */}

          {/* Fallas */}
          {activeTab === 3 &&
            <div className={`${isMobile && 'gap-2'}`} style={{fontSize: 12}}>
              <div className="row mb-2">
                <label className="mb-2 ">Reportar alguna falla</label>
                <div className="col-6">
                  <button
                    type="button"
                    onClick={(e) => setTieneFalla("NO")}
                    className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border rounded-2 ${
                      tieneFalla === "NO"
                        ? "btn-danger text-white border-danger shadow-sm"
                        : "bg-light text-secondary border-light-subtle"
                    }`}
                    style={{ transition: "all 0.2s ease" }}
                  >
                    <BsHandThumbsDownFill />
                    <span className="fw-bold">NO</span>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={(e) => setTieneFalla("SI")}
                    className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border rounded-2 ${
                      tieneFalla === "SI"
                        ? "btn-success text-white border-success shadow-sm"
                        : "bg-light text-secondary border-light-subtle"
                    }`}
                    style={{ transition: "all 0.2s ease" }}
                  >
                    <BsHandThumbsUpFill />
                    <span className="fw-bold">SI</span>
                  </button>
                </div>
              </div>
              {tieneFalla === 'SI' &&
                <div>
                  <div className="d-flex flex-column mb-3 w-100">
                    <label className="mb-2">Resumen de la falla</label>
                    <textarea
                      id="observations"
                      className="form-control"
                      value={search.observations}
                      onChange={handlerChangeSearch}
                      style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
                    ></textarea>
                  </div>
                
                  <div className="w-100">
                    <label className="fw-bold mb-2">EVIDENCIA</label>
                    <div
                      style={{
                        width: "100%",
                        height: 30,
                        border: previewUrl ? "2px solid green" : "2px solid #ccc",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        borderRadius: 5,
                      }}
                      onClick={(e) => (
                        openModal("evicencia", "Evidencia"), 
                        setTypeEvidence("Video"),
                        !previewUrl && startRecording(e)
                      )}
                    >
                      {previewPhoto ? (
                        <div style={{ color: "green" }}>
                          Haz Click aquí para ver el vídeo
                        </div>
                      ) : (
                        "Haz Click aquí para tomar el vídeo"
                      )}
                    </div>
                  </div>
                </div>
              }
              <div className="d-flex flex-row gap-3 pt-4 pb-1">
                <button
                  type="submit"
                  className="btn btn-sm btn-secondary fw-bold w-100"
                  onClick={(e) => setActiveTab(2)}
                >
                  <IoMdArrowRoundBack /> Volver
                </button>
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
                  onClick={(e)=> continuePage(e)}
                  /* onClick={(e) => id ? handleUpdate(e) : handleSubmit(e)} */
                >
                  {id ? 'ACTUALIZAR' : 'REGISTRAR'} 
                </button>
              </div>
            </div>
          }
        </div>
        {/* {JSON.stringify(evidence)} */}
      </div>

      {/* Modal para tomar fotos */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Capturar evidencia:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "enviroment", // 'user' para camara delante O 'enviroment' para la cámara trasera
                }}
                style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
              /> */}
          {!previewPhoto && typeEvidence === "Foto" ? (
            <div>
              <video
                ref={camaraRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px solid #ccc",
                  borderRadius: "10px",
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          ) : (
            typeEvidence === "Foto" && (
              <img
                src={previewPhoto}
                alt="Previsualización"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px solid #ccc",
                  borderRadius: "10px",
                }}
              />
            )
          )}
          {!previewUrl && typeEvidence === "Video" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded border h-full"
              height={"100%"}
              width={"100%"}
              style={{ height: isMobile ? "60vh" : "60vh" }}
            />
          ) : (
            !recording &&
            typeEvidence === "Video" &&
            previewUrl && (
              <div>
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded border"
                  height={"100%"}
                  width={"100%"}
                  style={{ height: isMobile ? "60vh" : "60vh" }}
                />
              </div>
            )
          )}
          {recording && (
            <div className="text-red-600 font-bold text-lg mt-2">
              ⏺ Grabando... {formatTime(elapsedTime)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* {typeEvidence === null && (
            <div className="d-flex gap-2">
              <button
                onClick={(e) => startCamera(e)}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Foto
              </button>
              <button
                onClick={(e) => setTypeEvidence("Video")}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Vídeo
              </button>
            </div>
          )} */}
          {typeEvidence === "Foto" ? (
            <div>
              {!previewPhoto ? (
                <div className="d-flex gap-2">
                  <button
                    onClick={(e) => capturePhoto(e)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Capturar
                  </button>
                  {/* <label
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Subir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      style={{ display: "none" }}
                    />
                  </label> */}
                </div>
              ) : ((previewPhoto && !id) &&
                <div className="div-botons">
                  <button
                    onClick={savePhoto}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => discardPhoto()}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Descartar
                  </button>
                </div>
              )}
            </div>
          ) : (
            typeEvidence === "Video" && (
              <div className="d-flex flex-column">
                {(!recording && previewUrl && !id) && (
                  <>
                    <div
                      className={`mt-2 d-flex div-botons justify-content-center ${
                        isMobile ? "gap-2" : "gap-4"
                      } `}
                    >
                      <button
                        onClick={uploadVideo}
                        className="bg-green-600 btn btn-sm btn-success text-black px-4 py-2 rounded"
                      >
                        📤 Guardar
                      </button>
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          setEvidence(null);
                          recordedChunks.current = [];
                          startRecording();
                        }}
                        className="bg-gray-500 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                      >
                        🔄 Grabar de nuevo
                      </button>
                    </div>
                  </>
                )}

                {/* {!recording && !previewUrl && (
                  <div
                    className={`mt-2 d-flex div-botons justify-content-center ${
                      isMobile ? "gap-2" : "gap-4"
                    } `}
                  >
                    <button
                      onClick={(e) => startRecording(e)}
                      className="bg-blue-600 btn btn-sm btn-primary text-black px-4 py-2 rounded"
                    >
                      ▶️ Iniciar grabación
                    </button>
                    <button
                      onClick={(e) => setTypeEvidence(null)}
                      className="bg-red-600 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                    >
                      ↩️ Volver
                    </button>
                  </div>
                )} */}

                {recording && (
                  <button
                    onClick={(stopRecording)}
                    className="bg-red-600 btn btn-sm btn-danger text-black px-6 py-2 rounded mt-1"
                  >
                    ⏹️ Detener grabación
                  </button>
                )}
              </div>
            )
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={loading} centered>
        <Modal.Body>
          <div className="d-flex align-items-center">
            <strong className="text-danger" role="status">
              Cargando...
            </strong>
            <div
              className="spinner-grow text-danger ms-auto"
              role="status"
            ></div>
          </div>
        </Modal.Body>
      </Modal>
      {/* </form> */}
    </div>
  );
}
