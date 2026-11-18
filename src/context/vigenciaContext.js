
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import AuthContext from "./authContext";

import {
  findVencimientosToday,
  findVencimientosTodayByCo
} from "../services/notificationService";

const VencimientoContext = createContext();

// Hora de Colombia
const getColombiaTime = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const hour = Number(
    parts.find(p => p.type === "hour").value
  );

  const minute = Number(
    parts.find(p => p.type === "minute").value
  );

  const second = Number(
    parts.find(p => p.type === "second").value
  );

  return { hour, minute, second };
};

// Verificar si ya son las 4 AM en Colombia
const isAfterFourAM = () => {
  const { hour } = getColombiaTime();
  return hour >= 4;
};

// Calcular cuánto falta para las próximas 4 AM
const getMillisecondsUntilFourAM = () => {
  const { hour, minute, second } = getColombiaTime();

  let milliseconds =
    ((4 - hour + 24) % 24) * 60 * 60 * 1000 -
    minute * 60 * 1000 -
    second * 1000;

  // Si ya pasaron las 4 AM, programar para mañana
  if (milliseconds <= 0) {
    milliseconds += 24 * 60 * 60 * 1000;
  }

  return milliseconds;
};

export const VencimientoProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [vencimientos, setVencimientos] = useState([]);
  const [loadingVencimientos, setLoadingVencimientos] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setVencimientos([]);
      setReady(false);
      setLoadingVencimientos(false);
      return;
    }

    let mounted = true;
    let timeout = null;
    let consultando = false;

    // Consultar vencimientos según el rol
    const loadVencimientos = async () => {
      if (!mounted || consultando) return;

      consultando = true;

      try {
        setLoadingVencimientos(true);

        let pends = [];

        if (user.role === "admin") {
          const { data } = await findVencimientosToday();
          pends = data || [];

        } else if (user.role === "jefe") {
          const { data } = await findVencimientosTodayByCo(user.co);
          pends = data || [];
        }

        if (mounted) {
          setVencimientos(pends);
          setReady(true);
        }

      } catch (error) {
        console.error(
          "Error cargando vencimientos:",
          error
        );

        if (mounted) {
          setReady(true);
        }

      } finally {
        consultando = false;

        if (mounted) {
          setLoadingVencimientos(false);
        }
      }
    };

    // Programar la siguiente consulta para las 4 AM
    const programarConsulta = () => {
      if (!mounted) return;

      const tiempo = getMillisecondsUntilFourAM();

      timeout = setTimeout(async () => {
        if (!mounted) return;

        await loadVencimientos();

        // Programar nuevamente para el día siguiente
        programarConsulta();

      }, tiempo);
    };

    // Si el usuario ingresa después de las 4 AM,
    // consultar inmediatamente.
    if (isAfterFourAM()) {
      loadVencimientos();
    }

    // Programar la consulta diaria
    programarConsulta();

    return () => {
      mounted = false;

      if (timeout) {
        clearTimeout(timeout);
      }
    };

  }, [user?.id, user?.role, user?.co]);

  return (
    <VencimientoContext.Provider
      value={{
        vencimientos,
        setVencimientos,
        loadingVencimientos,
        ready
      }}
    >
      {children}
    </VencimientoContext.Provider>
  );
};

export const useVencimientos = () => {
  return useContext(VencimientoContext);
};
