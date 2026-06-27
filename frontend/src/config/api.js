import axios from "axios";

const apiCliente = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    headers:{
        "Content-Type": "application/json"
    }
});
apiCliente.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token_keycloaken");
        if(token){
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default apiCliente;