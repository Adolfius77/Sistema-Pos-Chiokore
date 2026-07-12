import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "./env.js";

const apiCliente = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 30000,
});

apiCliente.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Dejar que el navegador ponga multipart boundary cuando hay FormData
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else if (!config.headers["Content-Type"]) {
            config.headers["Content-Type"] = "application/json";
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiCliente;
