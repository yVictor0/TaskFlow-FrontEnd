import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom'

function Rotaprivada({children}) {
    const {logado} = useAuth()
    if(!logado){
        return <Navigate to='/login' replace={true}/>
    }
    return children
}
export default Rotaprivada