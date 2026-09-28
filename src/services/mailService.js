import { config } from '../config'
const url = `${config.apiUrl2}/mail`;

function sendMail(body) {
  return fetch(url, {
    method: 'POST',
    /* headers: {
      'Content-Type': 'application/json',
    }, */
    body: body
  })
  .then(res => res.json())
  .then(res => res.data)
}

const sendMail2 = (body, id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/${id}`, {
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

const sendMailNotCondition = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/not/condition`, {
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

const sendMailNews = (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  return fetch(`${url}/news`, {
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

export {
  sendMail,
  sendMail2,
  sendMailNotCondition,
  sendMailNews,
}