import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/vehicles`;

const findVehicles = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOneVehicle = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findBycedula = async (cedula) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/cedula/${cedula}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findVehiclesByCo = async (co) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/agencia/${co}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createVehicle = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
      
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((res) => res);
};

const updateVehicle = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const deleteVehicle = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/id/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};

export { 
  findVehicles,
  findOneVehicle,
  findBycedula,
  findVehiclesByCo,
  createVehicle,
  updateVehicle,
  deleteVehicle 
};
