const titulo = 'TaskFlow'
const subtitulo = 'gerencia suas tarefas'
import './header.modulo.css'

function Header() {
    return(

        <header className='header'>
            <h1 className='textTop'>{titulo}</h1>
            <p id=''>{subtitulo}</p>
        </header>                                                              
    )
}

export default Header;