import { createContext, useContext, useState, useEffect } from "react";
import AuthContext from "./authContext";

import {
  findNotifications,
  findNotificationsByCo,
  findNotificationsToday,
  findNotificationsTodayByCo
} from "../services/notificationService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotificaciones([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);

        let notifications = [];

        if (user.role === "admin") {
          const { data } = await findNotifications();
          notifications = data || [];

        } else if (user.role === "jefe") {
          const { data } = await findNotificationsByCo(user.co);
          notifications = data || [];
        }

        setNotificaciones(notifications);

      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();

  }, [user?.role, user?.co]);

  const noLeidas = notificaciones.filter((notification) => {
    const usuariosQueLeyeron = String(notification.leidoPor || "")
      .split(",")
      .map(id => id.trim());

    return !usuariosQueLeyeron.includes(String(user.id));
  }).length;

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        setNotificaciones,
        noLeidas,
        loadingNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};