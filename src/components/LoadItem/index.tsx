// BIBLIOTECAS REACT
import { Col, Row, Typography } from 'antd'
import { ThreeCircles } from 'react-loader-spinner'

// CSS
import './styles.css'

const LoadItem = ( { title = 'Aguarde', type = 'normal' } : { title?: string, type?: string } ) => {

    return (
        <div className='load-item'>
            <Row justify={'center'} align={'middle'} style={{flexDirection: 'column'}}>
                <Col><Typography className={`load-item-text ${type}`}>{title}</Typography></Col>
                <Col>
                    <ThreeCircles
                        visible={true}
                        height="50"
                        width="50"
                        color={ type === 'normal' ? "#fff" : "var(--color02)" }
                        ariaLabel="grid-loading"
                        wrapperClass="grid-wrapper"
                    />
                </Col>
            </Row>
        </div>
    )

}

export default LoadItem