import { useMemo } from "react";
import { useEffect, useState } from "react";
import { BsHandThumbsUpFill, BsHandThumbsDownFill } from "react-icons/bs";

const QUESTIONS = [
  // SECCIÓN 1
  { 
      id: "header-documentacion", 
      label: "Verificación Documental y Kilometraje", 
      type: "header" 
    },
  { id: "ultimoKilometraje", label: "Último Kilometraje", type: "number", placeholder: "Ej: 125000" },
  { id: "portaLicenciaConduccion", label: "Porta Licencia Conducción", type: "binary" },
  { id: "portaLicenciaTransito", label: "Porta Licencia Tránsito", type: "binary" },
  { id: "portaSOAT", label: "Porta SOAT", type: "binary" },
  { id: "portaTecnicoMecanica", label: "Porta TecnicoMecánica", type: "binary" },
  { id: "portaCedula", label: "Porta Cédula", type: "binary" },

  // SECCIÓN 2
  { 
    id: "header-fluidos", 
    label: "Inspección de Líquidos y Fugas", 
    type: "header" 
  },
  { id: "aceiteMotor", label: "Aceite de Motor", type: "triple" },
  { id: "liquidoFrenos", label: "Líquido de Frenos", type: "triple" },
  { id: "nivelCombustible", label: "Nivel Combustible", type: "triple" },
  { id: "liquidoRefrigerante", label: "Líquido Refrigerante", type: "triple" },

  // SECCIÓN 3
  { 
    id: "header-llantas", 
    label: "Inspección de Llantas", 
    type: "header" 
  },
  { id: "estadoLlantas", label: "Estado de Llantas y sus componentes", type: "triple" },

  // SECCIÓN 4
  { 
    id: "header-luces", 
    label: "Inspección de Luces", 
    type: "header" 
  },
  { id: "lucesPrincipales", label: "Funcionamiento Luces Principales", type: "triple" },
  { id: "lucesDireccionales", label: "Funcionamiento Luces Direccionales", type: "triple" },
  { id: "lucesStop", label: "Funcionamiento Luz Stop o Freno", type: "triple" },

  // SECCIÓN 5
  { 
    id: "header-frenos", 
    label: "Inspección de Frenos", 
    type: "header" 
  },
  { id: "frenosGeneral", label: "Funcionamiento General de Frenos", type: "triple" },
  { id: "ManiguetaFreno", label: "Manigueta Freno", type: "triple" },

  // SECCIÓN 6
  { 
    id: "header-elementos-seguridad", 
    label: "Inspección Elementos de Seguridad", 
    type: "header" 
  },
  { id: "casco", label: "Casco Certificado", type: "triple" },
  { id: "calzado", label: "Calzado Cerrado", type: "triple" },
  { id: "chaleco", label: "Chaleco Reflectivo", type: "triple" },
  { id: "impermeable", label: "Equipo Impermeable", type: "triple" },
  { id: "guardabarros", label: "Guardabarros", type: "triple" },
  { id: "sillin", label: "Sillin", type: "triple" },
  { id: "Reposapies", label: "Reposapies", type: "triple" },
  { id: "Espejos", label: "Espejos Laterales", type: "triple" },
  { id: "Pito", label: "Pito", type: "triple" },
  { id: "cadena", label: "Cadena", type: "triple" },
  { id: "pata", label: "Pata de Encendido", type: "triple" },
  { id: "protectorExhosto", label: "Protector Exhosto", type: "triple" },
  { id: "maletin", label: "Maletín o canasta Transporte", type: "triple" },

  { 
    id: "header-elementos-seguridad", 
    label: "Otros Elementos", 
    type: "header" 
  },
  { id: "velocimetro", label: "Velocímetro", type: "triple" },
  { id: "placa", label: "Placa", type: "triple" },
  { id: "clutch", label: "Clutch Embrague", type: "triple" },

];

// Función auxiliar para agregar puntos de miles
const formatNumberWithCommas = (value) => {
  if (!value) return "";
  // Remueve todo lo que no sea dígito
  const rawValue = value.toString().replace(/\D/g, "");
  // Formatea agregando puntos como separador de miles
  return new Intl.NumberFormat("es-CO").format(rawValue);
};

export default function DynamicInspectionForm({ formData, setFormData, typeVehicle, news, setNews}) {

  useEffect(() => {
    if (!setNews) return;

    const novedades = Object.entries(formData)
      .filter(([_, val]) => val === "NO" || val === "MALO")
      .map(([id, valor]) => {
        const pregunta = QUESTIONS.find((q) => q.id === id);
        return {
          id,
          label: pregunta ? pregunta.label : id,
          valor,
        };
      });

    setNews(novedades);
  }, [formData, setNews]);

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleInputKm = (e, q) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Mantiene solo números
    const formattedValue = formatNumberWithCommas(rawValue);
    
    // Guardas el valor formateado (Ej: "125.000")
    handleChange(q.id, formattedValue);
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

  return (
    <div className="container-fluid py-0 px-0">
      <div className="row g-3">
        {QUESTIONS.map((q) => {
          // Renderizado de Encabezados de Sección
          if (q.type === "header") {
            return (
              <div key={q.id} className="col-12 mt-3 mb-1">
                <h6 className={`text-primary pb-0 mb-0 ${isMobile ? 'fs-6' : 'fw-bold'}`}>
                  {q.label}
                </h6>
              </div>
            );
          }

          const currentValue = formData[q.id] || "";

          return (
            <div key={q.id} className="col-12 col-md-6">
              <div
                className="bg-white p-3 border rounded-2 h-100 d-flex flex-column justify-content-between shadow-sm"
                style={{ fontSize: 12 }}
              >
                {/* Etiqueta */}
                <label className="form-label fw-semibold text-secondary small mb-2">
                  {q.label} <span className="text-danger">*</span>
                </label>

                {/* 1. INPUT NUMÉRICO CON SEPARADOR Y LÍMITES (1 - 100.000.000) */}
                {q.type === "number" && (
                  <div className="input-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control text-end fw-bold text-primary py-2"
                      placeholder={q.placeholder}
                      value={currentValue}
                      onChange={(e) => {
                        // 1. Extrae solo los números
                        const rawValue = e.target.value.replace(/\D/g, "");

                        if (!rawValue) {
                          handleChange(q.id, "");
                          return;
                        }

                        let numValue = parseInt(rawValue, 10);

                        // 2. Control de límites (Máximo 100,000,000)
                        if (numValue > 100000000) {
                          numValue = 100000000;
                        }

                        // 3. Formatea con separadores de miles y millones
                        const formattedValue = new Intl.NumberFormat("es-CO").format(numValue);

                        handleChange(q.id, formattedValue);
                      }}
                      onBlur={(e) => {
                        // Validación del mínimo al salir del input (evita dejarlo en 0)
                        const rawValue = e.target.value.replace(/\D/g, "");
                        if (rawValue && parseInt(rawValue, 10) < 1) {
                          handleChange(q.id, "1");
                        }
                      }}
                    />
                    <span className="input-group-text bg-light text-muted small fw-bold">
                      Km
                    </span>
                  </div>
                )}

                {/* 2. OPCIONALES SI / NO (2 botones) */}
                {q.type === "binary" && (
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => handleChange(q.id, "NO")}
                        className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border rounded-2 ${
                          currentValue === "NO"
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
                        onClick={() => handleChange(q.id, "SI")}
                        className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border rounded-2 ${
                          currentValue === "SI"
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
                )}

                {/* 3. TRIPLE OPCIÓN */}
                {q.type === "triple" && (
                  <div className="row">
                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() => handleChange(q.id, "BUENO")}
                        className={`btn w-100 py-2 d-flex flex-column flex-sm-row align-items-center justify-content-center border rounded-2 ${
                          currentValue === "BUENO"
                            ? "btn-success text-white border-success shadow-sm"
                            : "bg-light text-secondary border-light-subtle"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <BsHandThumbsUpFill style={{ fontSize: "0.85rem" }} />
                        <span className="fw-bold" style={{ fontSize: "0.7rem" }}>
                          {isMobile ? 'Bueno' : 'Buen estado'} 
                        </span>
                      </button>
                    </div>

                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() => handleChange(q.id, "MALO")}
                        className={`btn w-100 py-2 d-flex flex-column flex-sm-row align-items-center justify-content-center border rounded-2 ${
                          currentValue === "MALO"
                            ? "btn-danger text-white border-danger shadow-sm"
                            : "bg-light text-secondary border-light-subtle"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <BsHandThumbsDownFill style={{ fontSize: "0.85rem" }} />
                        <span className="fw-bold" style={{ fontSize: "0.7rem" }}>
                          {isMobile ? 'Malo' : 'Mal estado'} 
                        </span>
                      </button>
                    </div>

                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() => handleChange(q.id, "NA")}
                        className={`btn w-100 py-2 d-flex flex-column flex-sm-row align-items-center justify-content-center border rounded-2 ${
                          currentValue === "NA"
                            ? "btn-secondary text-white border-secondary shadow-sm"
                            : "bg-light text-secondary border-light-subtle"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>⛔</span>
                        <span className="fw-bold" style={{ fontSize: "0.7rem" }}>
                          {isMobile ? 'N/A' : 'No aplica'} 
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}