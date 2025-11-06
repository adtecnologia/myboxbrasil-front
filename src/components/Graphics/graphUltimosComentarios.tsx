// BIBLIOTECAS REACT
import { useRef, useState } from "react"
import { Avatar, Button, Col, Row, Typography } from "antd";

// CSS
import './styles.css';
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

// INTERFACE
interface GraphUltimosComentariosInterface {
    filters?: any,
    height?: string
}

// CSS
import './styles.css'

const GraphUltimosComentarios = ( { filters, height } : GraphUltimosComentariosInterface ) => {

    // REF GRAFICO
    const thisGraph = useRef<any>()

    // ESTADOS DO COMPONENTE
    const [ page, setPage ] = useState(1);

    // LISTA
    const list:any[] = []

    return (
        <div style={{height: height, overflow: 'hidden'}} ref={thisGraph}>
            { list.length > 0 ? (
                <Row gutter={[8,8]}>
                    <Col flex={'5em'}>
                        <Avatar className="dsh-cmt-avatar" src={list[page-1].avatar} />
                    </Col>
                    <Col flex={'auto'}>
                        <Typography className="dsh-cmt-name">{list[page-1].cliente}</Typography>
                        <Typography className="dsh-cmt-date">{list[page-1].data}</Typography>
                    </Col>
                    <Col span={24}>
                        <Typography className="dsh-cmt-text">{list[page-1].text}</Typography>
                    </Col>
                </Row>
            ) : <Typography>Não há comentários novos</Typography> }
            { list.length > 0 ? (
                <Row className="dsh-cmt-footer no-select" justify={'space-between'} align={'bottom'}>
                    <Col>
                        <Row gutter={[8,8]} align={'middle'}>
                            <Col style={{height: 18}}><IoChevronBack onClick={ () => setPage( page === 1 ? list.length : page-1 ) } className="dsh-cmt-arrow" /></Col>
                            <Col>{page}</Col>
                            <Col>/</Col>
                            <Col>{list.length}</Col>
                            <Col style={{height: 18}}><IoChevronForward onClick={ () => setPage( page === list.length ? 1 : page+1 ) } className="dsh-cmt-arrow" /></Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row gutter={[8,8]} align={'middle'}>
                            <Col> <Button type="default"> Marcar como lida </Button> </Col>
                            <Col> <Button type="primary"> Responder </Button> </Col>
                        </Row>
                    </Col>
                </Row>
            ) : null }
        </div>
    )

}

export default GraphUltimosComentarios