import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "./env.js";

const apiCliente = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiCliente.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiCliente;
