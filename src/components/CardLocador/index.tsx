// BIBLIOTECAS REACT
import { Avatar, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

// ICONES
import { IoStar } from 'react-icons/io5'

// CSS
import './styles.css'
import { FiMapPin } from 'react-icons/fi'

// INTERFACE
interface CardLocadorInterface {
    item: any,
    providerSelect: any,
    setProviderSelect: any,
}

const CardLocador = ( { item, providerSelect, setProviderSelect } : CardLocadorInterface ) => {

    return (
        <div className={`card-locador ${ providerSelect?.id === item.id ? 'active' : '' }`} onClick={() => setProviderSelect(item)}>
            <Avatar className="card-locador-avt" size={80} src={item?.photo} />
            <div style={{marginLeft: '1em'}}>
                <Typography className="card-locador-title">{item?.name}</Typography>
                <Typography className="card-locador-subtitle"><FiMapPin color='var(--color01)' style={{marginRight: '0.2em'}} /> {item.distance} Km</Typography>
            </div>
        </div>
    )

}

export default CardLocador