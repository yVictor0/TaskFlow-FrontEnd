import { useState } from 'react';
import api, { mensagensDeErro } from '../../interceptor/api';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await api.post('/auth/login', { email, senha });

      // Salva os dados de autenticação no localStorage
      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));

      // Redireciona para a tela principal
      window.location.href = '/taskflow';
    } catch (err) {
      console.error('Erro na requisição de login:', err);
      // Utiliza a função mensagensDeErro para obter a mensagem tratada
      const mensagens = mensagensDeErro(err);
      setErro(mensagens.join(' '));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleLogin}>
        <h2>TaskFlow</h2>
        <p>Faça login para continuar</p>

        {erro && <div className={styles.erro}>{erro}</div>}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default Login;