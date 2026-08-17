import axios from "axios";
import { useState } from 'react';
import style from './testeAxios.module.css';

function TesteAxios() {
    const [cep, setCep] = useState('');
    const [salveiOcep, setSalveiOcep] = useState('');
    const [endereco, setEndereco] = useState(null);

    async function pegaOcep() {
        const cepLimpo = cep.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            alert('CEP inválido! O CEP deve conter 8 dígitos.');
            return;
        }
    
        setSalveiOcep(cep);

        try {    
            const resposta = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            
            if (resposta.data.erro) {
                alert('CEP não encontrado na base de dados.');
                return;
            }

            console.log('response ', resposta.data);
            setEndereco(resposta.data);
        } catch (erro) {
            console.log(erro.message, 'Erro ao buscar o CEP');
            alert('Erro ao buscar o CEP. Verifique sua conexão.');
        } finally {
            setCep('');
        }
    }

    const lidarComTecla = (e) => {
        const caracteresPermitidos = /[0-9-]/;
        const teclasEspeciais = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

        if (!caracteresPermitidos.test(e.key) && !teclasEspeciais.includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === 'Enter') {
            pegaOcep();
        }
    };

    return (
        <div className={style.container}>
            <button onClick={pegaOcep}>Buscar</button>
            <input
                className="input"
                type="text"
                value={cep}
                required
                autoComplete='off'
                maxLength={9}
                onChange={(e) => setCep(e.target.value)}
                onKeyDown={lidarComTecla}
                placeholder="Digite o CEP (com ou sem -)"
            />
            <div>
                <p>O CEP buscado é: {salveiOcep}</p>
                {endereco && (
                    <div>
                        <p>Logradouro: {endereco.logradouro}</p>
                        <p>Bairro: {endereco.bairro}</p>
                        <p>Cidade: {endereco.localidade} - {endereco.uf}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TesteAxios;