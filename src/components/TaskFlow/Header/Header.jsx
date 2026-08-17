import './header.modulo.css'

const titulo = 'TaskFlow'
const subtitulo = 'gerencia suas tarefas'

function Header() {

    return (
        <header className='header'>
            
            <div className='brand'>
                <h1 className='textTop'>{titulo}</h1>
                <p className='subtitulo'>{subtitulo}</p>
            </div>
        </header>
    )
}

export default Header