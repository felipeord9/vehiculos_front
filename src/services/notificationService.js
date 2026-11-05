import axios from 'axios'
import { config } from '../config'
const url2 = `${config.apiUrl2}/notification`;

const findNotifications = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url2, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findNotificationsByCo = async (co) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/co/${co}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

//funciones para hallar las notificaciones
const findNotificationsToday = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/find/today`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}
const findNotificationsTodayByCo = async (co) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/find/today/${co}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}
///////

//funciones para hallar los pendientes
const findPendientesToday = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/find/pendientes/today`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}
const findPendientesTodayByCo = async (co) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/find/pendientes/today/${co}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}
////////

const findOneNotification = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url2}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const updateNotification= async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url2}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const agregarNombreNoti= async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url2}/agregar/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export {
  findNotifications,
  findNotificationsByCo,
  findNotificationsToday,
  findNotificationsTodayByCo,
  findOneNotification,
  findPendientesToday,
  findPendientesTodayByCo,
  updateNotification,
  agregarNombreNoti
}