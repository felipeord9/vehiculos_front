import axios from 'axios'
import { config } from "../config";
const url = `${config.apiUrl2}/preoperational`;

const findRecords = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findOneRecord = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findRecordsByAgency = async (co) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/co/${co}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const findRecordsByUser = async (username) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/user/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const createRecord = (body) => {
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

const updateRecord = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

const deleteRecord = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.delete(`${url}/id/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
};

export { 
  findRecords,
  findOneRecord,
  findRecordsByAgency,
  findRecordsByUser,
  createRecord,
  updateRecord,
  deleteRecord 
};