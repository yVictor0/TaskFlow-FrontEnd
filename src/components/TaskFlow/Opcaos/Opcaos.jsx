import './Opcao.module.css'

function Opcoes({ novaPropriedade, setNovaPropriedade }) {
  return (
    <select 
      id="sel-propriedade"
      value={novaPropriedade}
      onChange={(e) => setNovaPropriedade(e.target.value)}
    >
      <option value="Alta 🔴">Alta 🔴</option>
      <option value="Média 🟡">Média 🟡</option>
      <option value="Baixa 🟢">Baixa 🟢</option>
    </select>
  );
}

export default Opcoes;