
import { useMemo, useEffect, useState } from "react";
import {
  BsHandThumbsUpFill,
  BsHandThumbsDownFill,
} from "react-icons/bs";

// ======================================================
// PREGUNTAS DE LA INSPECCIÓN
// ======================================================
// Las preguntas sin "vehicles" aplican a todos.
// Los valores de vehicles se normalizan automáticamente.

const QUESTIONS = [
  // DOCUMENTACIÓN Y KILOMETRAJE
  {
    id: "header-documentacion",
    label: "Verificación Documental y Kilometraje",
    type: "header",
  },
  {
    id: "ultimoKilometraje",
    label: "Último Kilometraje",
    type: "number",
    placeholder: "Ej: 125000",
  },
  {
    id: "portaLicenciaConduccion",
    label: "Porta Licencia Conducción",
    type: "binary",
  },
  {
    id: "portaLicenciaTransito",
    label: "Porta Licencia Tránsito",
    type: "binary",
  },
  {
    id: "portaSOAT",
    label: "Porta SOAT",
    type: "binary",
  },
  {
    id: "portaTecnicoMecanica",
    label: "Porta Técnico-Mecánica",
    type: "binary",
  },
  {
    id: "portaCedula",
    label: "Porta Cédula",
    type: "binary",
  },

  // LÍQUIDOS Y FUGAS
  {
    id: "header-fluidos",
    label: "Inspección de Líquidos y Fugas",
    type: "header",
  },
  {
    id: "aceiteMotor",
    label: "Aceite de Motor",
    type: "triple",
  },
  {
    id: "liquidoFrenos",
    label: "Líquido de Frenos",
    type: "triple",
  },
  {
    id: "nivelCombustible",
    label: "Nivel Combustible",
    type: "triple",
  },
  {
    id: "liquidoRefrigerante",
    label: "Líquido Refrigerante",
    type: "triple",
    vehicles: ["CAMION", "MOTOCARRO"],
  },

  // LLANTAS
  {
    id: "header-llantas",
    label: "Inspección de Llantas",
    type: "header",
  },
  {
    id: "estadoLlantas",
    label: "Estado de Llantas y sus componentes",
    type: "triple",
  },

  // LUCES
  {
    id: "header-luces",
    label: "Inspección de Luces",
    type: "header",
  },
  {
    id: "lucesPrincipales",
    label: "Funcionamiento Luces Principales",
    type: "triple",
  },
  {
    id: "lucesDireccionales",
    label: "Funcionamiento Luces Direccionales",
    type: "triple",
  },
  {
    id: "lucesStop",
    label: "Funcionamiento Luz Stop o Freno",
    type: "triple",
  },

  // FRENOS
  {
    id: "header-frenos",
    label: "Inspección de Frenos",
    type: "header",
  },
  {
    id: "frenosGeneral",
    label: "Funcionamiento General de Frenos",
    type: "triple",
  },
  {
    id: "ManiguetaFreno",
    label: "Manigueta Freno",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },

  // ELEMENTOS DE SEGURIDAD
  {
    id: "header-elementos-seguridad",
    label: "Inspección Elementos de Seguridad",
    type: "header",
  },
  {
    id: "casco",
    label: "Casco Certificado",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "calzado",
    label: "Calzado Cerrado",
    type: "triple",
  },
  {
    id: "chaleco",
    label: "Chaleco Reflectivo",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "impermeable",
    label: "Equipo Impermeable",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "guardabarros",
    label: "Guardabarros",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "sillin",
    label: "Sillín",
    type: "triple",
  },
  {
    id: "Reposapies",
    label: "Reposapiés",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "Espejos",
    label: "Espejos Laterales",
    type: "triple",
  },
  {
    id: "Pito",
    label: "Pito",
    type: "triple",
  },
  {
    id: "cadena",
    label: "Cadena",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "pata",
    label: "Pata de Encendido",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "protectorExhosto",
    label: "Protector Exhosto",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },
  {
    id: "maletin",
    label: "Maletín o canasta Transporte",
    type: "triple",
    vehicles: ["MOTO", "MOTOCARRO"],
  },

  // OTROS ELEMENTOS
  {
    id: "header-otros-elementos",
    label: "Otros Elementos",
    type: "header",
  },
  {
    id: "velocimetro",
    label: "Velocímetro",
    type: "triple",
  },
  {
    id: "placa",
    label: "Placa",
    type: "triple",
  },
  {
    id: "clutch",
    label: "Clutch / Embrague",
    type: "triple",
    vehicles: ["CAMION", "MOTO", "MOTOCARRO"],
  },
  {
    id: "motorThermo",
    label: "Motor de Thermo",
    type: "triple",
    vehicles: ["CAMION"],
  },
  {
    id: "temperaturaThermo",
    label: "¿Thermo presenta temperaturas igual o menor a -15 grados?",
    type: "binary",
    vehicles: ["CAMION"],
  },
  {
    id: "novedadesMotor",
    label: "¿Presenta novedades en el motor?",
    type: "binary",
    vehicles: ["CAMION", "MOTO", "MOTOCARRO"],
  },
  {
    id: "novedadesLatoneria",
    label: "¿Presenta daños y/o desgaste en la latonería?",
    type: "binary",
    vehicles: ["CAMION", "MOTO", "MOTOCARRO"],
  },
  {
    id: "kitCarretera",
    label: "¿Kit de carretera al día?",
    type: "binary",
    vehicles: ["CAMION"],
  },
];

// ======================================================
// REGLAS DE NOTIFICACIÓN AL ADMINISTRADOR
// ======================================================
// Esta constante es independiente de QUESTIONS y news.
// Agrega aquí las preguntas que requieran notificación.
//
// values:
// "NO"    = respuesta negativa
// "SI"    = respuesta afirmativa
// "MALO"  = elemento en mal estado
// "BUENO" = elemento en buen estado
// "NA"    = no aplica

const ADMIN_NOTIFICATION_RULES = [
  {
    questionId: "aceiteMotor",
    values: ["MALO"],
  },
  {
    questionId: "liquidoFrenos",
    values: ["MALO"],
  },
  {
    questionId: "nivelCombustible",
    values: ["MALO"],
  },
  {
    questionId: "liquidoRefrigerante",
    values: ["MALO"],
  },
  {
    questionId: "estadoLlantas",
    values: ["MALO"],
  },
  {
    questionId: "lucesPrincipales",
    values: ["MALO"],
  },
  {
    questionId: "lucesDireccionales",
    values: ["MALO"],
  },
  {
    questionId: "lucesStop",
    values: ["MALO"],
  },
  {
    questionId: "frenosGeneral",
    values: ["MALO"],
  },
  {
    questionId: "ManiguetaFreno",
    values: ["MALO"],
  },
  {
    questionId: "casco",
    values: ["MALO"],
  },
  {
    questionId: "calzado",
    values: ["MALO"],
  },
  {
    questionId: "chaleco",
    values: ["MALO"],
  },
  {
    questionId: "impermeable",
    values: ["MALO"],
  },
  {
    questionId: "guardabarros",
    values: ["MALO"],
  },
  {
    questionId: "sillin",
    values: ["MALO"],
  },
  {
    questionId: "Reposapies",
    values: ["MALO"],
  },
  {
    questionId: "Espejos",
    values: ["MALO"],
  },
  {
    questionId: "Pito",
    values: ["MALO"],
  },
  {
    questionId: "cadena",
    values: ["MALO"],
  },
  {
    questionId: "pata",
    values: ["MALO"],
  },
  {
    questionId: "protectorExhosto",
    values: ["MALO"],
  },
  {
    questionId: "maletin",
    values: ["MALO"],
  },
  {
    questionId: "velocimetro",
    values: ["MALO"],
  },
  {
    questionId: "placa",
    values: ["MALO"],
  },
  {
    questionId: "clutch",
    values: ["MALO"],
  },
  {
    questionId: "motorThermo",
    values: ["MALO"],
  },
  {
    questionId: "temperaturaThermo",
    values: ["NO"],
  },
  {
    questionId: "novedadesMotor",
    values: ["SI"],
  },
  {
    questionId: "novedadesLatoneria",
    values: ["SI"],
  },
];

// ======================================================
// NORMALIZACIÓN DEL TIPO DE VEHÍCULO
// ======================================================

const normalizeVehicle = (value) => {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const aliases = {
    camion: "CAMION",
    automovil: "CAMION",
    auto: "CAMION",
    carro: "CAMION",
    moto: "MOTO",
    motocicleta: "MOTO",
    motocarguero: "MOTOCARRO",
    "moto carguero": "MOTOCARRO",
    motocarro: "MOTOCARRO",
  };

  return aliases[normalized] ?? normalized.toUpperCase();
};

// ======================================================
// COMPONENTE
// ======================================================

export default function DynamicInspectionForm({
  formData,
  setFormData,
  typeVehicle,
  news,
  setNews,
  setAdminNotifications,
}) {
  const [isMobile, setIsMobile] = useState(false);

  const currentFormData = formData ?? {};

  // ----------------------------------------------------
  // PREGUNTAS VISIBLES SEGÚN EL VEHÍCULO
  // ----------------------------------------------------

  const visibleQuestions = useMemo(() => {
    const vehicle = normalizeVehicle(typeVehicle);

    const filteredQuestions = QUESTIONS.filter((question) => {
      if (question.type === "header") return true;

      if (!question.vehicles) return true;

      return question.vehicles
        .map(normalizeVehicle)
        .includes(vehicle);
    });

    // Ocultar encabezados que no tengan preguntas visibles.
    return filteredQuestions.filter((question, index, array) => {
      if (question.type !== "header") return true;

      const nextHeaderIndex = array.findIndex(
        (item, itemIndex) =>
          itemIndex > index && item.type === "header"
      );

      const endIndex =
        nextHeaderIndex === -1
          ? array.length
          : nextHeaderIndex;

      return array
        .slice(index + 1, endIndex)
        .some((item) => item.type !== "header");
    });
  }, [typeVehicle]);

  // ----------------------------------------------------
  // NOVEDADES GENERALES
  // ----------------------------------------------------
  // Conserva aquí las respuestas NO y MALO de las
  // preguntas visibles de la inspección.

  const calculatedNews = useMemo(() => {
    const visibleIds = new Set(
      visibleQuestions
        .filter((question) => question.type !== "header")
        .map((question) => question.id)
    );

    return Object.entries(currentFormData)
      .filter(
        ([id, value]) =>
          visibleIds.has(id) &&
          (value === "NO" || value === "MALO")
      )
      .map(([id, valor]) => {
        const question = QUESTIONS.find(
          (item) => item.id === id
        );

        return {
          id,
          label: question?.label ?? id,
          valor,
        };
      });
  }, [currentFormData, visibleQuestions]);

  // ----------------------------------------------------
  // NOTIFICACIONES AL ADMINISTRADOR
  // ----------------------------------------------------
  // Se calculan de forma independiente de calculatedNews.

  const adminNotifications = useMemo(() => {
    const visibleIds = new Set(
      visibleQuestions
        .filter((question) => question.type !== "header")
        .map((question) => question.id)
    );

    return ADMIN_NOTIFICATION_RULES
      .filter((rule) => {
        const answer = currentFormData[rule.questionId];

        return (
          visibleIds.has(rule.questionId) &&
          rule.values.includes(answer)
        );
      })
      .map((rule) => {
        const question = QUESTIONS.find(
          (item) => item.id === rule.questionId
        );

        return {
          questionId: rule.questionId,
          question: question?.label ?? rule.questionId,
          answer: currentFormData[rule.questionId],
          message: rule.message,
        };
      });
  }, [currentFormData, visibleQuestions]);

  // ----------------------------------------------------
  // ACTUALIZAR DATOS EN EL COMPONENTE PADRE
  // ----------------------------------------------------

  useEffect(() => {
    setNews?.(calculatedNews);
  }, [calculatedNews, setNews]);

  useEffect(() => {
    setAdminNotifications?.(adminNotifications);
  }, [adminNotifications, setAdminNotifications]);

  // ----------------------------------------------------
  // RESPONSIVE
  // ----------------------------------------------------

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ----------------------------------------------------
  // ACTUALIZAR RESPUESTA
  // ----------------------------------------------------

  const handleChange = (fieldId, value) => {
    setFormData((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  };

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <div className="container-fluid py-0 px-0">
      <div className="row g-3">
        {visibleQuestions.map((question) => {
          // ENCABEZADOS
          if (question.type === "header") {
            return (
              <div
                key={question.id}
                className="col-12 mt-3 mb-1"
              >
                <h6
                  className={`text-primary pb-0 mb-0 ${
                    isMobile ? "fs-6" : "fw-bold"
                  }`}
                >
                  {question.label}
                </h6>
              </div>
            );
          }

          const currentValue =
            currentFormData[question.id] ?? "";

          return (
            <div
              key={question.id}
              className="col-12 col-md-6"
            >
              <div
                className="bg-white p-3 border rounded-2 h-100 d-flex flex-column justify-content-between shadow-sm"
                style={{ fontSize: 12 }}
              >
                <label className="form-label fw-semibold text-secondary small mb-2">
                  {question.label}{" "}
                  <span className="text-danger">*</span>
                </label>

                {/* KILOMETRAJE */}
                {question.type === "number" && (
                  <div className="input-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control text-end fw-bold text-primary py-2"
                      placeholder={question.placeholder}
                      value={currentValue}
                      onChange={(event) => {
                        const rawValue =
                          event.target.value.replace(/\D/g, "");

                        if (!rawValue) {
                          handleChange(question.id, "");
                          return;
                        }

                        let numValue = parseInt(rawValue, 10);

                        if (numValue > 100000000) {
                          numValue = 100000000;
                        }

                        const formattedValue =
                          new Intl.NumberFormat("es-CO").format(
                            numValue
                          );

                        handleChange(
                          question.id,
                          formattedValue
                        );
                      }}
                      onBlur={(event) => {
                        const rawValue =
                          event.target.value.replace(/\D/g, "");

                        if (
                          rawValue &&
                          parseInt(rawValue, 10) < 1
                        ) {
                          handleChange(question.id, "1");
                        }
                      }}
                    />

                    <span className="input-group-text bg-light text-muted small fw-bold">
                      Km
                    </span>
                  </div>
                )}

                {/* RESPUESTAS SI / NO */}
                {question.type === "binary" && (
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(question.id, "NO")
                        }
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
                        onClick={() =>
                          handleChange(question.id, "SI")
                        }
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

                {/* RESPUESTAS BUENO / MALO / NO APLICA */}
                {question.type === "triple" && (
                  <div className="row g-2">
                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(question.id, "BUENO")
                        }
                        className={`btn w-100 py-2 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1 border rounded-2 ${
                          currentValue === "BUENO"
                            ? "btn-success text-white border-success shadow-sm"
                            : "bg-light text-secondary border-light-subtle"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <BsHandThumbsUpFill
                          style={{ fontSize: "0.85rem" }}
                        />
                        <span
                          className="fw-bold"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {isMobile ? "Bueno" : "Buen estado"}
                        </span>
                      </button>
                    </div>

                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(question.id, "MALO")
                        }
                        className={`btn w-100 py-2 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1 border rounded-2 ${
                          currentValue === "MALO"
                            ? "btn-danger text-white border-danger shadow-sm"
                            : "bg-light text-secondary border-light-subtle"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <BsHandThumbsDownFill
                          style={{ fontSize: "0.85rem" }}
                        />
                        <span
                          className="fw-bold"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {isMobile ? "Malo" : "Mal estado"}
                        </span>
                      </button>
                    </div>

                    <div className="col-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(question.id, "NA")
                        }
                        className={`btn w-100 py-2 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1 border rounded-2 ${
                          currentValue === "NA"
                            ? "btn-secondary text-white border-secondary shadow-sm"
                            : "bg-light text-secondary border-light-subtle"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>
                          ⛔
                        </span>

                        <span
                          className="fw-bold"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {isMobile ? "N/A" : "No aplica"}
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
