import axios from "axios";

// Trata as mensagens de erro retornadas pela API ou problemas de rede
export function mensagensDeErro(erro) {
  const dados = erro.response?.data;

  // Sem resposta do servidor (API fora do ar, URL errada, CORS, timeout)
  if (!dados) {
    return ["Não foi possível conectar à API."];
  }

  // Lista de detalhes de validação
  if (dados.detalhes) {
    return Array.isArray(dados.detalhes) ? dados.detalhes : [dados.detalhes];
  }

  // Mensagem direta de erro
  const mensagem = dados.erro || dados.mensagem || "Ocorreu um erro inesperado.";
  return [mensagem];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Interceptor de Requisição: Anexa o Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de Resposta: Redireciona em caso de erro 401 (Exceto na rota de Login)
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const ehLogin =
      erro.config?.url?.includes("/auth/login") ||
      erro.config?.url?.includes("/login");

    if (erro.response?.status === 401 && !ehLogin) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(erro);
  }
);

export default api;