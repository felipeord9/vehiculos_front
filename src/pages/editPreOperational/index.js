import { useEffect, useState, useContext, useRef } from "react";
import ClientContext from "../../context/clientContext";
import { sendMail , sendMail2 } from "../../services/mailService";
import { sendEvidence } from "../../services/evidence";
import AuthContext from "../../context/authContext";
import ComboBox from "../../components/ComboBox";
import { findOneRecord } from "../../services/preOperationalService";
import InspectionAdminAccordion from "../../components/InspectionAdminAccordion";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { config } from '../../config';
import Webcam from 'react-webcam';
import Swal from "sweetalert2";
import "./styles.css";

export default function EditPreOperational() {
  const { user, setUser } = useContext(AuthContext);
  const { client, setClient } = useContext(ClientContext);
  const { id } = useParams();
  const [agencia, setAgencia] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [typeEvidence, setTypeEvidence] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const navigate = useNavigate();
  const refHealth = useRef(); 
  const [productosAgr, setProductosAgr] = useState({
    agregados: [],
    total: "0",
  });
  const [search, setSearch] = useState({
    idCliente: "",
    descCliente: "",
    observations: "",
    order: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState(false);
  const selectBranchRef = useRef();
  const [evidence, setEvidence] = useState(null);
  const webcamRef = useRef(null);
  const ImgFirmaRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // Foto en previsualización

  const [videoEvidencia, setVideoEvidencia] = useState('');

  useEffect(() => {
    if(user && (user.role === 'admin' || user.role === 'solicitante')){
    setLoading(true)
    findOneRecord(id)
      .then(({data})=>{
        const url = `${config.apiUrl2}/upload/obtener-archivo/evidence_${data.id}`
        setSearch(data)
        setVideoEvidencia(url)
      })
      .catch(()=>{
        console.log('error')
        setSuggestions({})
        Swal.fire({
          icon:'warning',
          title:'¡ATENCIÓN!',
          text:'Ha ocurrido un error al momento de abrir el vínculo. Vuelve a intentarlo, si el problema persiste comunícate con la auxiliar del fondo de empleados.',
          confirmButtonText:'OK',
          confirmButtonColor:'red'
        })
        .then(()=>{
            window.location.href = "about:blank"
        })
      })
    }else{
      navigate('/login')
    }
  }, [id]);

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

  // Formatear tiempo como mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const findById = (id, array, setItem) => {
    const item = array.find((elem) => elem.nit === id);
    if (item) {
      setItem(item);
    } else {
      setItem(null);
      setSucursal(null);
      selectBranchRef.current.selectedIndex = 0;
    }
  };

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };

  const idParser = (id) => {
    let numeroComoTexto = id.toString();
    while (numeroComoTexto.length < 8) {
      numeroComoTexto = "0" + numeroComoTexto;
    }
    return numeroComoTexto;
  };

  const changeType = (e) => {
    setSearch({
      ...search,
      idCliente: "",
    });
    setInvoiceType(!invoiceType);
    setClient(null);
    setSucursal(null);
    selectBranchRef.current.selectedIndex = 0;
  };

/*   const handleSubmit = (e) => {
    e.preventDefault();
    if( invoiceType ? (agencia !== null ) : (client !== null) ) {
      if (productosAgr.agregados.length <= 0) {
        Swal.fire({
          title: "¡Atención!",
          text: "No hay productos en la lista, agregue al menos uno",
          icon: "warning",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#198754",
          timer: 2500,
        });
      } else
        Swal.fire({
          title: "¿Está seguro?",
          text: "Se registrará la solicitud de devoluciones y/o averías",
          icon: "warning",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#198754",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
        }).then(({ isConfirmed }) => {
          if (isConfirmed) {
            setLoading(true);
            var body = {
              client: client ? client : null,
              agency: agencia ? agencia : null,
              seller: sucursal ? sucursal.vendedor : null,
              branch: sucursal ? sucursal : null,
              products: productosAgr,
              createdAt: new Date(),
              createdBy: user.id,
              state: 'Solicitado',
              observations: search.observations,
              destiny: invoiceType ? 'auditoriacontable@granlangostino.net' : 'cordinadoragencias@granlangostino.com',
              typeApplicant: invoiceType ? 'Agencia' : 'Cliente'
              //file: JSON.stringify(files),
            };
            createLavado(body)
              .then(({data}) => {
                const f = new FormData();
                if(typeEvidence === 'Foto'){
                  f.append('evidence', evidence, 'evidence.jpg')
                }
                if(typeEvidence === 'Video'){
                  f.append('evidence', evidence, 'evidence.webm')
                }
                f.append('tipo', typeEvidence)
                f.append('id', data.id)
                f.append("info", JSON.stringify(body))
                if(evidence !== null){
                  sendEvidence(f)
                  .then(()=>{
                    sendMail2(body, data.id)
                    .then(()=>{
                      setLoading(false);
                      Swal.fire({
                        title: "¡Creación exitosa!",
                        text: `
                          La orden de devolución y averías se ha realizado satisfactoriamente.
                          Por favor revise el correo y verifique la información.
                        `,
                        icon: "success",
                        confirmButtonText: "Aceptar",
                      }).then(() => {
                        window.location.reload();
                      });
                    })
                    .catch(()=>{
                      setLoading(false);
                        Swal.fire({
                          title: "¡Ha ocurrido un error!",
                          text: `
                          Hubo un error al momento de enviar el correo, intente de nuevo.
                          Si el problema persiste por favor comuniquese con el área de sistemas.`,
                          icon: "error",
                          confirmButtonText: "Aceptar",
                        });
                    })
                  })
                  .catch(()=>{
                    setLoading(false);
                    deleteLavado(data.id);
                    Swal.fire({
                      title: "¡Ha ocurrido un error!",
                      text: `
                      Hubo un error al momento de guardar la evidencia de la solicitud de devoluciones y averías, intente de nuevo.
                      Si el problema persiste por favor comuniquese con el área de sistemas.`,
                      icon: "error",
                      confirmButtonText: "Aceptar",
                    });
                  })
                }else{
                  sendMail2(body, data.id)
                  .then(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "¡Creación exitosa!",
                      text: `
                        La orden de devolución y averías se ha realizado satisfactoriamente.
                        Por favor revise el correo y verifique la información.
                      `,
                      icon: "success",
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      window.location.reload();
                    });
                  })
                  .catch(()=>{
                    setLoading(false);
                      Swal.fire({
                        title: "¡Ha ocurrido un error!",
                        text: `
                        Hubo un error al momento de enviar el correo, intente de nuevo.
                        Si el problema persiste por favor comuniquese con el área de sistemas.`,
                        icon: "error",
                        confirmButtonText: "Aceptar",
                      });
                  })
                }
              })
              .catch((err) => {
                setLoading(false);
                Swal.fire({
                  title: "¡Ha ocurrido un error!",
                  text: `
                  Hubo un error al momento de registrar la solicitud de devoluciones y averías, intente de nuevo.
                  Si el problema persiste por favor comuniquese con el área de sistemas.`,
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
            });
          }
        });
    }else{
      Swal.fire({
        icon:'warning',
        title:'¡ATENCIÓN!',
        text:'Debes llenar todos los campos requeridos para hacer la solicitud de devoluciones y averías.',
        timer: 8000,
        showConfirmButton: false,
      })
    }
  }; */

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
      stream.getTracks().forEach(track => track.stop());
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
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  /* Version anterior 
    const capturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setPreviewPhoto(photo); // Mostrar previsualización
  }; */

  //descartar foto en el modal
  const discardPhoto = () => {
    setPreviewPhoto(null); // Mostrar previsualización
    setTypeEvidence(null);
    setEvidence(null);
  };
  // Guardar la foto en el estado correspondiente
  const savePhoto = async () => {
    const response = await fetch(previewPhoto);
    const imageBlob = await response.blob();
    setEvidence((imageBlob))
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
        facingMode: { ideal: 'environment' },
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
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
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
      const video = new Blob(recordedChunks.current, { type: 'video/webm' })
      setEvidence(video)
      closeModal();
    };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <div>
        <InspectionAdminAccordion apiResponse={search} video={videoEvidencia} isMobile={isMobile}/>
      </div>
    </div>
  );
}
