// BIBLIOTECAS REACT
import { Breadcrumb, Col, Row } from "antd";

// ICONES
import { RiHome3Line } from "react-icons/ri";

// CSS
import './styles.css'; 
import { Link } from "react-router-dom";
import { verifyConfig } from "../../services";
import LoadItem from "../LoadItem";

// INTERFACE
interface PageDefaultInterface {
    children?: any,
    items: any[],
    options?: any,
    valid: any
}

const PageDefault = ( { children, items, options, valid } : PageDefaultInterface ) => {

    if (verifyConfig(valid)) {
        return (
            <Row>
                <Col span={24} className="page-default-padding">
                    <Row justify={'space-between'} align={'middle'}>
                        <Col><Breadcrumb className="page-default-breadcrumb" items={[ { title: <Link to="/painel/dashboard">Painel</Link> }, ...items]} /></Col>
                        <Col>{options}</Col>
                    </Row>
                </Col>
                <Col span={24} style={{marginTop: 16}} className="page-default-page page-default-padding">
                    {children}
                </Col>
            </Row>
        )
    } else {
        return <LoadItem title="Você não tem permissão para acessar essa página"/>
    }

}

export default PageDefault;