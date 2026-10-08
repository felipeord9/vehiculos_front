import axios from 'axios';
import { config } from '../config';

const url = config.apiUrl2

export const filesDrivers = async(formData) =>{
    try {
      const {data}= await axios.post(`${url}/files/driver/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return data;
    } catch (error) {
      throw error;
    }
}

export const deleteFileDriver = (folderName)=>{
  return fetch(`${url}/files/driver/${folderName}`,{
    method:'DELETE',
    headers:{
      "Content-Type": "application/json",
    },
  })
  .then((res) => res.json())
  .then((res) => res);
}