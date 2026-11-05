
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import AuthContext from "./authContext";

import {
  findPendientesToday,
  findPendientesTodayByCo
} from "../services/notificationService";

const PreOpePendContext = createContext();

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

export const PreOpePendProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [pendientes, setPendientes] = useState([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setPendientes([]);
      setReady(false);
      return;
    }

    let mounted = true;

    const loadPendientes = async () => {
      // Antes de las 9 AM no consultar
      if (!isAfterNineAM()) {
        if (mounted) {
          setPendientes([]);
          setReady(false);
        }
        return;
      }

      try {
        if (mounted) setLoadingPendientes(true);

        let pends = [];

        if (user.role === "admin") {
          const { data } = await findPendientesToday();
          pends = data || [];

        } else if (user.role === "jefe") {
          const { data } = await findPendientesTodayByCo(user.co);
          pends = data || [];
        }

        if (mounted) {
          setPendientes(pends);
          setReady(true);
        }

      } catch (error) {
        console.error("Error cargando pendientes:", error);
      } finally {
        if (mounted) setLoadingPendientes(false);
      }
    };

    // Primera consulta
    loadPendientes();

    // Revisar cada minuto si ya son las 9 AM.
    // Una vez habilitado, actualizar cada 5 minutos.
    const interval = setInterval(() => {
      loadPendientes();
    }, isAfterNineAM() ? 5 * 60 * 1000 : 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };

  }, [user?.id, user?.role, user?.co]);

  return (
    <PreOpePendContext.Provider
      value={{
        pendientes,
        setPendientes,
        loadingPendientes,
        ready
      }}
    >
      {children}
    </PreOpePendContext.Provider>
  );
};

export const usePendientes = () => {
  return useContext(PreOpePendContext);
};
