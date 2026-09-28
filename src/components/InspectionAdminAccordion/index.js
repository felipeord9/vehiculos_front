import React from "react";
import { BsCheckCircleFill, BsXCircleFill, BsDashCircleFill } from "react-icons/bs";

// 1. DICCIONARIO DE PREGUNTAS
const QUESTIONS = [
  // SECCIÓN 1
  { id: "header-documentacion", label: "Verificación Documental y Kilometraje", type: "header" },
  { id: "ultimoKilometraje", label: "Último Kilometraje", type: "number" },
  { id: "portaLicenciaConduccion", label: "Porta Licencia Conducción", type: "binary" },
  { id: "portaLicenciaTransito", label: "Porta Licencia Tránsito", type: "binary" },
  { id: "portaSOAT", label: "Porta SOAT", type: "binary" },
  { id: "portaTecnicoMecanica", label: "Porta TecnicoMecánica", type: "binary" },
  { id: "portaCedula", label: "Porta Cédula", type: "binary" },

  // SECCIÓN 2
  { id: "header-fluidos", label: "Inspección de Líquidos y Fugas", type: "header" },
  { id: "aceiteMotor", label: "Aceite de Motor", type: "triple" },
  { id: "liquidoFrenos", label: "Líquido de Frenos", type: "triple" },
  { id: "nivelCombustible", label: "Nivel Combustible", type: "triple" },
  { id: "liquidoRefrigerante", label: "Líquido Refrigerante", type: "triple" },

  // SECCIÓN 3
  { id: "header-llantas", label: "Inspección de Llantas", type: "header" },
  { id: "estadoLlantas", label: "Estado de Llantas y sus componentes", type: "triple" },

  // SECCIÓN 4
  { id: "header-luces", label: "Inspección de Luces", type: "header" },
  { id: "lucesPrincipales", label: "Funcionamiento Luces Principales", type: "triple" },
  { id: "lucesDireccionales", label: "Funcionamiento Luces Direccionales", type: "triple" },
  { id: "lucesStop", label: "Funcionamiento Luz Stop o Freno", type: "triple" },

  // SECCIÓN 5
  { id: "header-frenos", label: "Inspección de Frenos", type: "header" },
  { id: "frenosGeneral", label: "Funcionamiento General de Frenos", type: "triple" },
  { id: "ManiguetaFreno", label: "Manigueta Freno", type: "triple" },

  // SECCIÓN 6
  { id: "header-elementos-seguridad", label: "Inspección Elementos de Seguridad", type: "header" },
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

  // SECCIÓN 7
  { id: "header-otros", label: "Otros Elementos", type: "header" },
  { id: "velocimetro", label: "Velocímetro", type: "triple" },
  { id: "placa", label: "Placa", type: "triple" },
  { id: "clutch", label: "Clutch Embrague", type: "triple" },

];

// 2. FUNCIÓN DE MAPEO (Convierte los nombres del Backend a las IDs de QUESTIONS)
const mapBackendToQuestions = (apiData) => {
  if (!apiData) return {};

  return {
    ultimoKilometraje: apiData.lastKm ? `${apiData.lastKm} Km` : "N/R",
    portaLicenciaConduccion: apiData.licenciaConduccion,
    portaLicenciaTransito: apiData.licenciaTransito,
    portaSOAT: apiData.soat,
    portaTecnicoMecanica: apiData.tecno,
    portaCedula: apiData.cedula,
    aceiteMotor: apiData.aceiteMotor,
    liquidoFrenos: apiData.liquidoFrenos,
    nivelCombustible: apiData.nivelCombustuble, // Corrige typos del backend
    liquidoRefrigerante: apiData.liquidoRefrigerante,
    estadoLlantas: apiData.llantas,
    lucesPrincipales: apiData.lucesPrincipales,
    lucesDireccionales: apiData.lucesDireccionales,
    lucesStop: apiData.luzStop,
    frenosGeneral: apiData.estadoFrenos,
    ManiguetaFreno: apiData.maniguetaFrenos,
    casco: apiData.casco,
    calzado: apiData.calzado,
    chaleco: apiData.chaleco,
    impermeable: apiData.impermeable,
    guardabarros: apiData.guardabarros,
    sillin: apiData.sillin,
    Reposapies: apiData.reposaPies,
    Espejos: apiData.espejoLateral,
    Pito: apiData.pito,
    cadena: apiData.cadena,
    pata: apiData.pataEncendido,
    protectorExhosto: apiData.protectorExhosto,
    maletin: apiData.maletin,
    velocimetro: apiData.velocimetro,
    placa: apiData.placa,
    clutch: apiData.clutch,
    reportarFalla: apiData.fallas || "NO",
    resumenInspeccion: apiData.resumenFallas || "Te autorizamos para conducir el Vehículo el día de hoy",
    evidenciaVideo: apiData.evidencia // Puede ser un booleano, string URL o null
  };
};

export default function InspectionAdminAccordion({ apiResponse, video, isMobile }) {
  // Mapeamos los datos limpios
  const formattedData = mapBackendToQuestions(apiResponse);

  // Agrupamos las preguntas por sección (header)
  const sections = QUESTIONS.reduce((acc, q) => {
    if (q.type === "header") {
      acc.push({ header: q, items: [] });
    } else if (acc.length > 0) {
      acc[acc.length - 1].items.push(q);
    }
    return acc;
  }, []);

  // Formato visual de badges
  const renderStatusBadge = (val) => {
    if (val === "SI" || val === "BUENO") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold">
          <BsCheckCircleFill className="me-1 mb-1" />
          {val}
        </span>
      );
    }
    if (val === "NO" || val === "MALO") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">
          <BsXCircleFill className="me-1 mb-1" />
          {val}
        </span>
      );
    }
    if (val === "NA") {
      return (
        <span className="badge bg-light text-muted border fw-normal">
          <BsDashCircleFill className="me-1 mb-1" />
          N/A
        </span>
      );
    }
    return <span className="fw-bold text-dark">{val || "N/R"}</span>;
  };

  return (
    <div className="py-0">
      {/* Encabezado con datos generales del vehículo y conductor */}
      <div className="card mb-3 border-0 shadow-sm bg-light">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-primary mb-1">
              {apiResponse?.plate} - {apiResponse?.typeVehicle}
            </h5>
            <div className="text-muted small" style={{fontSize: 12}}>
              <strong>Conductor:</strong> {apiResponse?.rowId} - {apiResponse?.driver} | <strong>C.O:</strong> {apiResponse?.co}
            </div>
          </div>
          <span style={{fontSize: 12}} className={`badge ${apiResponse?.health === 'SIN LIMITACIÓN DE SALUD' ? 'bg-success' : 'bg-danger' }  py-2 px-3`}>{apiResponse?.health === 'SIN LIMITACIÓN DE SALUD' ? `✅ ${apiResponse?.health}` : `⛑️ CON LIMITACIÓN DE SALUD`}</span>
        </div>
      </div>

      {/* ACORDEÓN DE SECCIONES */}
      <div className="accordion shadow-sm rounded-3 mb-3" id="adminInspectionAccordion">
        {sections.map((sec, idx) => {
          const accordionId = `collapse-admin-${idx}`;
          const headerId = `heading-admin-${idx}`;

          // Contar número de novedades/fallas por sección (NO o MALO)
          const issuesCount = sec.items.filter((item) => {
            const val = formattedData[item.id];
            return val === "NO" || val === "MALO";
          }).length;

          return (
            <div className="accordion-item border-0 border-bottom" key={sec.header.id + idx}>
              <h2 className="accordion-header" id={headerId}>
                <button
                  className="accordion-button collapsed py-3"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${accordionId}`}
                  aria-expanded="false"
                  aria-controls={accordionId}
                >
                  <div className="d-flex align-items-center justify-content-between w-100 me-3">
                    <span className="fw-bold text-secondary">{sec.header.label}</span>

                    {/* Badge que le avisa al admin si hay algo malo sin necesidad de abrir */}
                    {apiResponse?.health === 'SIN LIMITACIÓN DE SALUD' ?
                      (issuesCount > 0 ? (
                        <span className="badge bg-danger rounded-pill px-2 py-1 small">
                          ⚠️ {issuesCount} {issuesCount === 1 ? "novedad" : "novedades"}
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                          ✓ Sin Novedad
                        </span>
                      ))
                      :
                      <span className="badge bg-secondary rounded-pill px-2 py-1 small">
                        No Realizado
                      </span>
                    }
                  </div>
                </button>
              </h2>

              <div
                id={accordionId}
                className="accordion-collapse collapse"
                aria-labelledby={headerId}
                data-bs-parent="#adminInspectionAccordion"
                style={{fontSize: 12}}
              >
                <div className="accordion-body p-0">
                  <table className="table table-hover table-striped mb-0 align-middle">
                    <thead className="table-light small">
                      <tr style={{fontSize: 14}}>
                        <th className="ps-3 py-2 text-muted" style={{ width: "70%" }}>
                          Ítem Evaluado
                        </th>
                        <th className="pe-3 py-2 text-end text-muted" style={{ width: "30%" }}>
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((item) => {
                        const val = formattedData[item.id];
                        const isFailure = val === "NO" || val === "MALO";

                        return (
                          <tr key={item.id} className={isFailure ? "table-danger-subtle" : ""}>
                            <td className="ps-3 py-2 small fw-medium text-dark">{item.label}</td>
                            <td className="pe-3 py-2 text-end" style={{fontSize: 13}}>{renderStatusBadge(val)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* fallas */}
      <div className="card mb-3 border-0 shadow-sm bg-light">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold text-primary mb-1">
              Reporte de fallas
            </h5>
            {apiResponse?.resumenFallas && (
              <div className="text-muted small" style={{ fontSize: 12 }}>
                <strong>Resumen de la falla:</strong> {apiResponse.resumenFallas}
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              style={{ fontSize: 12 }}
              className={`badge ${apiResponse?.fallas === 'NO' ? 'bg-success' : apiResponse?.fallas === 'SI' ? 'bg-danger' : 'bg-secondary'} py-2 px-3`}
            >
              {apiResponse?.fallas === 'SI' ? '⚠️ Falla reportada' : apiResponse?.fallas === 'NO' ? '✓ Sin Novedad' : 'No Realizado'}
            </span>

            {/* Botón para desplegar el video únicamente si existe evidencia */}
            {apiResponse?.evidencia && video && (
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseVideoEvidencia"
                aria-expanded="false"
                aria-controls="collapseVideoEvidencia"
                style={{ fontSize: 12 }}
              >
                📹 Ver Evidencia
              </button>
            )}
          </div>
        </div>

        {/* Contenedor colapsable del video */}
        {apiResponse?.evidencia && video && (
          <div className="collapse" id="collapseVideoEvidencia">
            <div className="card-body pt-0">
              <video
                src={video}
                controls
                className="w-100 rounded border"
                style={{ height: isMobile ? '100%' : '60vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}