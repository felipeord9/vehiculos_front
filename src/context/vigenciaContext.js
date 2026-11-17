
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

  const hour = Number(parts.find(p => p.type === "hour").value);
  const minute = Number(parts.find(p => p.type === "minute").value);

  return { hour, minute };
};

const isAfterNineAM = () => {
  const { hour } = getColombiaTime();
  return hour >= 9;
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
      return;
    }

    let mounted = true;

    const loadVencimientos = async () => {
      // Antes de las 9 AM no consultar
      if (!isAfterNineAM()) {
        if (mounted) {
          setVencimientos([]);
          setReady(false);
        }
        return;
      }

      try {
        if (mounted) setLoadingVencimientos(true);

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
        console.error("Error cargando vencimientos:", error);
      } finally {
        if (mounted) setLoadingVencimientos(false);
      }
    };

    // Primera consulta
    loadVencimientos();

    // Revisar cada minuto si ya son las 9 AM.
    // Una vez habilitado, actualizar cada 5 minutos.
    const interval = setInterval(() => {
      loadVencimientos();
    }, isAfterNineAM() ? 5 * 60 * 1000 : 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
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
