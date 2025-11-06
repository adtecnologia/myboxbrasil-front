// react libraries
import { Col, Row } from "antd";

// components
import PageDefault from "../../../components/PageDefault";

// css
import './styles.css'

// services
import { verifyConfig } from "../../../services";

// pages
import Regioes from "./Regioes";
import Residuos from "./Residuos";
import Enderecos from "./Enderecos";
import Meta from "./Meta";
import LicencaAmbiental from "./LicencaAmbiental";

const Configuracoes = () => {

    return (
        <PageDefault valid={true} items={[
            { title: 'Configurações' },
        ]}>
            <Row gutter={[16,16]}>
                { verifyConfig(['conf.met.list']) ? (
                    <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                        <Meta />
                    </Col>
                ) : null }
                { verifyConfig(['conf.cdd.list']) ? (
                    <Col span={24}>
                        <Regioes />
                    </Col>
                ) : null }
                { verifyConfig(['conf.rsd.list']) ? (
                    <Col span={24}>
                        <Residuos />
                    </Col>
                ) : null }
                { verifyConfig(['add.list']) ? (
                    <Col span={24}>
                        <Enderecos />
                    </Col>
                ) : null }
                { verifyConfig(['conf.lcs.list']) ? (
                    <Col span={24}>
                        <LicencaAmbiental />
                    </Col>
                ) : null }
            </Row>
        </PageDefault>
    )

}

export default Configuracoes;