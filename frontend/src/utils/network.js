import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_FASTAPI_URL || "http://aiedu.tplinkdns.com:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})
