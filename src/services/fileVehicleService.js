import axios from 'axios';
import { config } from '../config';

const url = config.apiUrl2

export const filesVehicles = async(formData) =>{
    try {
      const {data}= await axios.post(`${url}/files/vehicle/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return data;
    } catch (error) {
      throw error;
    }
}

export const deleteFileVehicle = (folderName)=>{
  return fetch(`${url}/files/vehicle/${folderName}`,{
    method:'DELETE',
    headers:{
      "Content-Type": "application/json",
    },
  })
  .then((res) => res.json())
  .then((res) => res);
}