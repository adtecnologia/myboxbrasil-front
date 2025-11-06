// BIBLIOTECAS REACT
import { Col, Row, Typography } from 'antd'

// CSS
import './styles.css'

// INTERFACE
interface CardKPISmallInterface {
    title: string,
    icon: any,
    value: any
}

const CardKPISmall = ( { title, icon, value } : CardKPISmallInterface ) => {

    return (
        <div className='card-kpi'>
            <Row gutter={[12,12]}>
                <Col span={24}>
                    <Typography className='card-kpi-title'>{title}</Typography>
                </Col>
                <Col span={24}>
                    <Row justify={'space-between'}>
                        <Col><Typography className='card-kpi-value'>{value}</Typography></Col>
                        <Col>{icon}</Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )

}

export default CardKPISmall