// BIBLIOTECAS REACT
import { Col, Row, Typography } from 'antd'

// CSS
import './styles.css'

// INTERFACE
interface CardItemInterface {
    title?: any,
    children: any,
    option?: any
}

const CardItem = ( { title, children, option } : CardItemInterface ) => {

    return (
        <div className='card-item'>
            <Row gutter={[12,12]}>
                { title ?
                    <Col span={24} style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Typography className='card-item-title'>{title}</Typography>
                        { option ? option : null }
                    </Col>
                : null }
                { children ? (
                    <Col span={24}>
                        {children}
                    </Col>
                ) : null }
            </Row>
        </div>
    )

}

export default CardItem