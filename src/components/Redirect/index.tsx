// BIBLIOTECAS REACT
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"


const Redirect = ( ) => {

    // RESPONSAVEL PELA ROTA
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/painel/dashboard')
    })

    return <></>

}

export default Redirect