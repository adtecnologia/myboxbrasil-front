// BIBLIOTECAS REACT
import { Image, Skeleton, Typography } from 'antd'

// CSS
import './styles.css'

// INTERFACE
interface CardModelInterface {
    item: any,
    modelSelect: any,
    setModelSelect: any,
}

const CardModel = ( { item, modelSelect, setModelSelect } : CardModelInterface ) => {

    return (
        <div className={`card-model ${ modelSelect?.id === item.id ? 'active' : '' }`}>
            <div className='card-model-div' onClick={() =>  {setModelSelect(item)}}>
                <Image preview={false} className="card-model-img" src={item.photo} alt={item.name} placeholder={<Skeleton.Avatar shape='square' />} />
                <Typography className="card-model-title">Modelo {item.name} - {item.m3}m³</Typography>
            </div>
        </div>
    )

}

export default CardModel