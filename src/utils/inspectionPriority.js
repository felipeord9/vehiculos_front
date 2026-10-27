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

export const getRecordPriority = (row) => {
  const alerts = inspectionRules.filter((rule) => {
    const response = row[rule.field];

    return (
      response !== null &&
      response !== undefined &&
      String(response).trim().toUpperCase() === rule.trigger
    );
  });

  if (alerts.some((alert) => alert.level === "ALTO")) {
    return "ALTO";
  }

  if (alerts.some((alert) => alert.level === "MEDIO")) {
    return "MEDIO";
  }

  if (alerts.some((alert) => alert.level === "BAJO")) {
    return "BAJO";
  }

  return "SIN NOVEDADES";
};