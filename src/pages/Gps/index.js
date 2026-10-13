
import React, { useCallback, useEffect, useState } from 'react';
import { config } from '../../config';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './styles.css';

// Íconos personalizados para cada tipo de vehículo
const createVehicleIcon = (emoji) =>
  L.divIcon({
    className: 'vehicle-marker',
    html: `<div class="vehicle-marker__icon">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20],
  });

const vehicleIcons = {
  car: createVehicleIcon('🚗'),
  truck: createVehicleIcon('🚚'),
  motorcycle: createVehicleIcon('🏍️'),
  default: createVehicleIcon('📍'),
};

const getVehicleIcon = (type = '') => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes('motorcycle')) {
    return vehicleIcons.motorcycle;
  }

  if (normalizedType.includes('truck')) {
    return vehicleIcons.truck;
  }

  if (normalizedType.includes('car')) {
    return vehicleIcons.car;
  }

  return vehicleIcons.default;
};

const Gps = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchIturanData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.apiUrl2}/ituran`);

      if (!response.ok) {
        throw new Error('No fue posible consultar los vehículos.');
      }

      const responseData = await response.json();
      const xml = responseData.data;

      if (typeof xml !== 'string' || !xml.trim()) {
        throw new Error('La API no devolvió información XML.');
      }

      const document = new DOMParser().parseFromString(
        xml,
        'application/xml'
      );

      if (document.querySelector('parsererror')) {
        throw new Error('La respuesta XML tiene un formato inválido.');
      }

      const nodes = Array.from(document.getElementsByTagName('V'));

      const parsedVehicles = nodes.map((node) => {
        const getValue = (tag) =>
          node.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';

        const latitude = Number(getValue('Y'));
        const longitude = Number(getValue('X'));
        const speed = Number(getValue('SP'));
        const odometer = Number(getValue('OD'));

        const gpsCode = getValue('GS');
        const vehicleCode = getValue('VS');

        return {
          id: getValue('DV') || getValue('PN'),
          placa: getValue('PN') || 'Sin placa',
          nombre: getValue('NN') || 'Sin nombre',
          conductor: getValue('DN') || 'Sin conductor',
          latitud: latitude,
          longitud: longitude,
          velocidad: Number.isFinite(speed) ? speed : 0,
          odometro: Number.isFinite(odometer) ? odometer : null,
          fechaEvento: getValue('ET'),
          tipoVehiculo: getValue('IFN'),
          evento: getValue('EN'),
          ubicacion: getValue('RG'),
          estadoGPS:
            gpsCode === '2'
              ? 'OK'
              : gpsCode === '3'
                ? 'Sin señal'
                : 'Desconocido',
          estadoVehiculo:
            vehicleCode === '1'
              ? 'En movimiento'
              : vehicleCode === '2'
                ? 'Detenido'
                : vehicleCode === '3'
                  ? 'Apagado'
                  : 'Desconocido',
        };
      });

      setVehicles(parsedVehicles);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando vehículos de Ituran:', err);
      setError(err.message || 'Error al cargar los vehículos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timeoutId;

    const updateVehicles = async () => {
      await fetchIturanData();

      if (active) {
        timeoutId = setTimeout(updateVehicles, 60_000);
      }
    };

    updateVehicles();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [fetchIturanData]);

  const validVehicles = vehicles.filter(
    (v) =>
      Number.isFinite(v.latitud) &&
      Number.isFinite(v.longitud) &&
      v.latitud >= -90 &&
      v.latitud <= 90 &&
      v.longitud >= -180 &&
      v.longitud <= 180 &&
      v.latitud !== 0 &&
      v.longitud !== 0
  );

  const movingCount = vehicles.filter(
    (v) => v.estadoVehiculo === 'En movimiento'
  ).length;

  const formatNumber = (value) =>
    value == null
      ? 'N/A'
      : value.toLocaleString('es-CO', {
          maximumFractionDigits: 1,
        });

  if (loading && vehicles.length === 0) {
    return (
      <div className="gps-loading">
        <div className="spinner-border text-danger" role="status" />
        <p>Cargando vehículos...</p>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="alert alert-danger m-3">
        {error}
        <button
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={fetchIturanData}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className='container mt-5'>
      <div className="gps-page">
        <div className="gps-header">
          <div>
            <h2>Seguimiento de flota</h2>
            <p>Monitoreo GPS de vehículos · El Gran Langostino</p>
          </div>

          <button
            className="btn btn-danger"
            onClick={fetchIturanData}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>

        {error && (
          <div className="alert alert-warning">
            {error} Se conservan los últimos datos recibidos.
          </div>
        )}

        <div className="gps-stats">
          <div className="gps-stat">
            <span>Total de vehículos</span>
            <strong>{vehicles.length}</strong>
          </div>

          <div className="gps-stat">
            <span>Con ubicación</span>
            <strong>{validVehicles.length}</strong>
          </div>

          <div className="gps-stat">
            <span>En movimiento</span>
            <strong>{movingCount}</strong>
          </div>

          <div className="gps-stat">
            <span>Última consulta</span>
            <strong className="gps-stat__time">
              {lastUpdate
                ? lastUpdate.toLocaleTimeString('es-CO')
                : 'Pendiente'}
            </strong>
          </div>
        </div>

        <div className="gps-map-container">
          <MapContainer
            center={[4.5709, -74.2973]}
            zoom={6}
            scrollWheelZoom={true}
            className="gps-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validVehicles.map((v) => (
              <Marker
                key={v.id}
                position={[v.latitud, v.longitud]}
                icon={getVehicleIcon(v.tipoVehiculo)}
              >
                <Popup>
                  <div className="gps-popup">
                    <h6>{v.placa}</h6>

                    <p>
                      <strong>Vehículo:</strong> {v.nombre}
                    </p>

                    <p>
                      <strong>Conductor:</strong> {v.conductor}
                    </p>

                    <p>
                      <strong>Estado:</strong> {v.estadoVehiculo}
                    </p>

                    <p>
                      <strong>Velocidad:</strong> {v.velocidad} km/h
                    </p>

                    <p>
                      <strong>Odómetro:</strong>{' '}
                      {formatNumber(v.odometro)} km
                    </p>

                    <p>
                      <strong>GPS:</strong> {v.estadoGPS}
                    </p>

                    <p>
                      <strong>Último evento:</strong> {v.fechaEvento}
                    </p>

                    {v.ubicacion && (
                      <p>
                        <strong>Referencia:</strong> {v.ubicacion}
                      </p>
                    )}

                    <a
                      href={`https://www.google.com/maps?q=${v.latitud},${v.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="gps-legend">
          <span>🚗 Carro</span>
          <span>🚚 Camión</span>
          <span>🏍️ Moto</span>
          <span>📍 Otro dispositivo</span>
        </div>

        <p className="gps-footer">
          Se actualiza automáticamente cada 60 segundos. Vehículos con
          coordenadas válidas: {validVehicles.length}.
        </p>
      </div>
    </div>
  );
};

export default Gps;
