import { useState } from "react";
import Swal from "sweetalert2";

export default function InspectionTabs({ currentTab, setTab, tap1Enable, tap2Enable, tap3Enable }) {
  const tabs = [
    { id: 1, label: "Información del Vehiculo y Conductor", isEnabled: tap1Enable },
    { id: 2, label: "Verificación del Vehiculo", isEnabled: tap2Enable },
    { id: 3, label: "Reportar Fallas", isEnabled: tap3Enable },
  ];

  const handleTabClick = (tab) => {
    // Si la pestaña actual está deshabilitada y no es la primera, mostramos una alerta
    if (!tab.isEnabled && tab.id > 1) {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Debes llenar el formulario por orden',
        timer: 50000,
        showConfirmButton: false
      })
      alert("Por favor, llene el formulario anterior para poder avanzar a esta sección.");
    } else {
      // De lo contrario, cambiamos a la pestaña seleccionada
      setTab(tab.id);
    }
  };

  return (
    <div className="w-100 border-bottom bg-white">
      <div className="d-flex justify-content-between align-items-center text-center">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              // Usamos la función handleTabClick para gestionar el clic
              onClick={() => handleTabClick(tab)}
              // Deshabilitamos la pestaña si no está habilitada y no es la primera
              disabled={!tab.isEnabled && tab.id > 1}
              className={`btn border-0 py-3 px-2 flex-fill fw-medium position-relative ${
                isActive ? "text-warning fw-bold" : "text-secondary opacity-75"
              }`}
              style={{
                fontSize: "0.875rem",
                transition: "color 0.2s ease",
              }}
            >
              <span className="d-block text-wrap mx-auto" style={{ maxWidth: "180px" }}>
                {tab.label}
              </span>

              {/* Indicador inferior activo (Línea naranja con bordes redondeados) */}
              {isActive && (
                <div
                  className="position-absolute bottom-0 start-0 w-100 bg-warning"
                  style={{
                    height: "4px",
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}