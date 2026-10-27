import { useState, useEffect, useContext } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Modal , Button , Form, Table } from "react-bootstrap";
import AuthContext from "../../context/authContext";
import DataTable from "react-data-table-component";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { TfiTicket } from "react-icons/tfi";
import { GrDeliver } from "react-icons/gr";
import Checkbox from '@mui/material/Checkbox';
import * as FaIcons from "react-icons/fa";
import DocLavadosPDF from "../DocLavadosPDF";
import { FaEdit } from "react-icons/fa";
import FormControlLabel from '@mui/material/FormControlLabel';
import { updateRecord } from "../../services/preOperationalService";
import { sendEvidence } from "../../services/evidence";
import Chulo from '../../assets/chulo-verde.png'
import { GiCancel } from "react-icons/gi";
import { FiEdit2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Swal from "sweetalert2";
import "./styles.css";

const inspectionRules = [
  // Verificación documental
  { field: "licenciaConduccion", label: "Licencia conducción", trigger: "NO", level: "ALTO" },
  { field: "licenciaTransito", label: "Licencia tránsito", trigger: "NO", level: "ALTO" },
  { field: "soat", label: "SOAT", trigger: "NO", level: "ALTO" },
  { field: "tecno", label: "Tecnomecánica", trigger: "NO", level: "ALTO" },
  { field: "cedula", label: "Cédula", trigger: "NO", level: "ALTO" },

  // Líquidos y fugas
  { field: "aceiteMotor", label: "Aceite de motor", trigger: "MALO", level: "ALTO" },
  { field: "liquidoFrenos", label: "Líquido de frenos", trigger: "MALO", level: "ALTO" },
  { field: "nivelCombustuble", label: "Nivel combustible", trigger: "MALO", level: "MEDIO" },
  { field: "liquidoRefrigerante", label: "Líquido refrigerante", trigger: "MALO", level: "MEDIO" },

  // Llantas y luces
  { field: "llantas", label: "Llantas", trigger: "MALO", level: "MEDIO" },
  { field: "lucesPrincipales", label: "Luces principales", trigger: "MALO", level: "MEDIO" },
  { field: "lucesDireccionales", label: "Luces direccionales", trigger: "MALO", level: "MEDIO" },
  { field: "luzStop", label: "Luz stop", trigger: "MALO", level: "MEDIO" },

  // Frenos
  { field: "estadoFrenos", label: "Estado de frenos", trigger: "MALO", level: "ALTO" },
  { field: "maniguetaFrenos", label: "Manigueta frenos", trigger: "MALO", level: "ALTO" },

  // Elementos de seguridad
  { field: "casco", label: "Casco certificado", trigger: "MALO", level: "ALTO" },
  { field: "calzado", label: "Calzado cerrado", trigger: "MALO", level: "MEDIO" },
  { field: "chaleco", label: "Chaleco reflectivo", trigger: "MALO", level: "BAJO" },
  { field: "impermeable", label: "Equipo impermeable", trigger: "MALO", level: "MEDIO" },
  { field: "guardabarros", label: "Guardabarros", trigger: "MALO", level: "BAJO" },
  { field: "sillin", label: "Sillín", trigger: "MALO", level: "BAJO" },
  { field: "reposaPies", label: "Reposapiés", trigger: "MALO", level: "BAJO" },
  { field: "espejoLateral", label: "Espejos laterales", trigger: "MALO", level: "MEDIO" },
  { field: "pito", label: "Pito", trigger: "MALO", level: "MEDIO" },
  { field: "cadena", label: "Cadena", trigger: "MALO", level: "ALTO" },
  { field: "pataEncendido", label: "Pata de encendido", trigger: "MALO", level: "MEDIO" },
  { field: "protectorExhosto", label: "Protector exhosto", trigger: "MALO", level: "BAJO" },
  { field: "maletin", label: "Maletín o canasta", trigger: "MALO", level: "MEDIO" },

  // Otros elementos
  { field: "velocimetro", label: "Velocímetro", trigger: "MALO", level: "MEDIO" },
  { field: "placa", label: "Placa", trigger: "MALO", level: "MEDIO" },
  { field: "clutch", label: "Clutch o embrague", trigger: "MALO", level: "ALTO" },

  // Elementos adicionales de thermo
  { field: "condicionesMotorThermo", label: "Condiciones motor thermo", trigger: "MALO", level: "MEDIO" },
  { field: "temperaturaThermo", label: "Temperatura thermo", trigger: "NO", level: "MEDIO" },
  { field: "novedadesMotor", label: "Novedades en el motor", trigger: "SI", level: "ALTO" },
  { field: "danosLatoneria", label: "Daños en latonería", trigger: "SI", level: "BAJO" },
  { field: "sonidoMecanico", label: "Sonido mecánico", trigger: "SI", level: "ALTO" },
  { field: "extintorBotiquin", label: "Extintor y botiquín", trigger: "NO", level: "ALTO" },
];

const semaforoStyles = {
  ALTO: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    border: "1px solid #FCA5A5",
  },
  MEDIO: {
    backgroundColor: "#FFEDD5",
    color: "#C2410C",
    border: "1px solid #FDBA74",
  },
  BAJO: {
    backgroundColor: "#FEF9C3",
    color: "#854D0E",
    border: "1px solid #FDE047",
  },
};

// Busca las respuestas que coinciden con las reglas
const getInspectionAlerts = (row) =>
  inspectionRules.filter((rule) => {
    const response = row[rule.field];

    return (
      response !== null &&
      response !== undefined &&
      String(response).trim().toUpperCase() === rule.trigger
    );
  });

function TablePreOperation({ records, getAllRecords, loading }) {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [docAsociado, setDocAsociado] = useState('');
  const [nameReceiver, setNameReceiver] = useState('');
  const [nameDriver, setNameDriver] = useState('');
  const [recogiendo, setRecogiendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const navigate = useNavigate();
  const columns = [
    {
      id: "ver",
      name: "",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          <button 
            title="Editar registro" className='btn btn-sm btn-primary'
            style={{color:'white'}}
            onClick={(e) => {
              navigate(`/pre/operational/${row.id}`)
            }}
          >
            <FaEye />
          </button>
          {((user.role === 'admin' || user.role === 'jefe') && !row.firmaJefe)  &&
            <button 
              title="Firmar" className='btn btn-sm btn-warning'
              style={{backgroundColor: '#f36d5e'}}
              onClick={(e)=> {
                handleSignatureBoss(e, row.id)
              }}
            >
              <CiEdit />
            </button>
          }
        </div>
      ),
      width: (user.role === 'admin' || user.role === 'jefe') ? '80px' : '50px'
    },
    {
      id: "id",
      name: "id",
      selector: (row) => `${row.id}`,
      width: "60px",
    },
    {
      id: "driver",
      name: "Conductor",
      selector: (row) => `${row.driver}`,
      width: "250px",
    },
    {
      id: "plate",
      name: "Placa",
      selector: (row) => `${row.plate}`,
      width: "110px",
    },
    {
      id: "fallas",
      name: "Fallas",
      /* selector: (row) => {
        row?.fallas
      }, */
      cell: (row) => {
        const alerts = getInspectionAlerts(row);

        // Solo mostrar la prioridad más alta encontrada
        const priority = ["ALTO", "MEDIO", "BAJO"].find((level) =>
          alerts.some((alert) => alert.level === level)
        );
        return(
          <label>{(priority || row?.fallas) ? 'SI' : 'NO'}</label>
        )
      },
      sortable: true,
      width: "95px",
    }, 
    {
      id: "prioridad",
      name: "Prioridad",
      width: "125px",
      sortable: true,
      selector: (row) => {
        const alerts = getInspectionAlerts(row);

        if (alerts.some((alert) => alert.level === "ALTO")) return 3;
        if (alerts.some((alert) => alert.level === "MEDIO")) return 2;
        if (alerts.some((alert) => alert.level === "BAJO")) return 1;

        return 0;
      },

      cell: (row) => {
        const alerts = getInspectionAlerts(row);

        // Solo mostrar la prioridad más alta encontrada
        const priority = ["ALTO", "MEDIO", "BAJO"].find((level) =>
          alerts.some((alert) => alert.level === level)
        );

        if (!priority && row?.health !== 'CON LIMITACIÓN DE SALUD') {
          return (
            <span
              style={{
                backgroundColor: "#DCFCE7",
                color: "#15803D",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "12px",
                margin: 0,
              }}
            >
              SIN NOVEDADES
            </span>
          );
        } else if(!priority && row?.health === 'CON LIMITACIÓN DE SALUD'){
          return (
            <span
              className="btn-sm btn-secondary"
              style={{
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "12px",
                margin: 0,
              }}
            >
              NO APLICA
            </span>
          );
        }

        const colors = semaforoStyles[priority];

        return (
          <span
            style={{
              backgroundColor: colors.backgroundColor,
              color: colors.color,
              border: colors.border,
              padding: "4px 16px",
              borderRadius: "6px",
              margin: 0,
              fontWeight: "bold",
              fontSize: "13px",
            }}
            title={`${alerts.length} novedad(es) detectada(s)`}
          >
            {priority}
          </span>
        );
      },
    },
    {
      id: "C.O",
      name: "Centro de Operación",
      selector: (row) => `${row.agency.rowId} - ${row.agency.description}`,
      width: "240px",
    },
    {
      id: "health",
      name: "Estado de salud",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 w-100 justify-content-center align-items-center'>
          <label 
            className={`w-100 align-text-center justify-content-center rounded-2
              d-flex ${row?.health === 'CON LIMITACIÓN DE SALUD' ? 'bg-danger' : 'bg-success'}`
            }
            style={{color:'white'}}
          >
            {row?.health}
          </label>
        </div>
      ),
      sortable: true,
      width: "220px",
    },
    {
      id: "evidencia",
      name: 'Evidencia',
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.evidencia} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'155px'
    },
    {
      id: "created_by",
      name: "Creado por",
      selector: (row) => (row.createdBy),
      sortable: true,
      width: "180px",
    }, 
    {
      id: "created_at",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: "200px",
    },
  ];

  const customStyles = {
    rows: {
      style: {
        height:'15px', // ajusta el alto de las filas según tus necesidades
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        height:'35px',
        color:'white',
        backgroundColor:'#007bff',
        paddingLeft:10,
        paddingRight:10
      },
    },
    cells: {
      style: {
        paddingLeft:10,
        paddingRight:10
      },
    },
    columns:{
      style: {
        borderLeft:'5px black solid'
      }
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", () =>
      setIsMobile(mediaQuery.matches)
    );
    return () =>
      mediaQuery.removeEventListener("change", () =>
        setIsMobile(mediaQuery.matches)
      );
  }, []);

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

  const handleSignatureBoss = (e, id) => {
    e.preventDefault();
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

          // Convertir firma a archivo
          const firmaFile = dataURLtoFile(signatureBase64, "firmaConductor.png");

          var body = {
            firmaJefe: true,
          };

          // 1. Guardar el registro inicial
          updateRecord(id, body)
            .then(({ data }) => {
              // 2. Preparar el FormData para enviar la firma
              const f = new FormData();
              f.append("id", data.id);
              f.append("info", JSON.stringify(body));
              f.append("firmaJefe", firmaFile, "firmaJefe.png");

              // 3. Subir el archivo al servidor
              sendEvidence(f)
                .then(() => {
                  Swal.fire({
                    title: "¡Creación exitosa!",
                    text: "Se ha firmado satisfactoriamente.",
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
                .catch(() => {
                  Swal.fire({
                    title: "¡Ha ocurrido un error!",
                    text: "Hubo un error al momento de guardar la firma, intente de nuevo. Si el problema persiste por favor comuníquese con el área de sistemas.",
                    icon: "warning",
                    confirmButtonText: "Aceptar",
                  });
                });
            })
            .catch((err) => {
              Swal.fire({
                title: "¡Ha ocurrido un error!",
                text: "Hubo un error al momento de guardar la firma, intente de nuevo. Si el problema persiste por favor comuníquese con el área de sistemas.",
                icon: "warning",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
  };
  

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0 table-orders"
      style={{ width: "100%" , height: isMobile ? '75vh' : '80vh'}}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={records}
        customStyles={customStyles}
        fixedHeaderScrollHeight={200}
        defaultSortField="id"           // Campo a ordenar por defecto
        defaultSortAsc={false}                  // false = descendente
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[15, 25, 50, 100]}
        noDataComponent={
          <div style={{ padding: 24 }}>Ningún resultado encontrado.</div>
        }
      />

    </div>
  );
}

export default TablePreOperation;
