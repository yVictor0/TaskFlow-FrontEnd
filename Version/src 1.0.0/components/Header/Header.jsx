import './header.modulo.css'

const titulo = 'TaskFlow'
const subtitulo = 'gerencia suas tarefas'

function Header({ tarefas = [] }) {

    const totalTarefas = tarefas.length;
    
    const pendentes = tarefas.filter(t => !t.concluida).length;
    
    const concluidas = tarefas.filter(t => t.concluida).length;
    
    return (
        <header className='header'>
            
            <div className='brand'>
                <h1 className='textTop'>{titulo}</h1>
                <p className='subtitulo'>{subtitulo}</p>
            </div>

            <nav className='nav'>
                <span className='navItem'>Tarefas ({totalTarefas})</span>
                <span className='navItem'>Pendentes ({pendentes})</span>
                <span className='navItem'>Concluídas ({concluidas})</span>
            </nav>
        </header>
    )
}

export default Header