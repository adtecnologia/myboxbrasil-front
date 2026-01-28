// BIBLIOTECAS REACT
import { Breadcrumb, Col, Row } from "antd";

// CSS
import "./styles.css";
import { Link } from "react-router-dom";
import { verifyConfig } from "../../services";
import LoadItem from "../LoadItem";

// INTERFACE
interface PageDefaultInterface {
  children?: any;
  items: any[];
  options?: any;
  valid: any;
}

const PageDefault = ({
  children,
  items,
  options,
  valid,
}: PageDefaultInterface) => {
  if (verifyConfig(valid)) {
    return (
      <Row>
        <Col className="page-default-padding" span={24}>
          <Row align={"middle"} justify={"space-between"}>
            <Col>
              <Breadcrumb
                className="page-default-breadcrumb"
                items={[
                  { title: <Link to="/painel/dashboard">Painel</Link> },
                  ...items,
                ]}
              />
            </Col>
            <Col>{options}</Col>
          </Row>
        </Col>
        <Col
          className="page-default-page page-default-padding"
          span={24}
          style={{ marginTop: 16 }}
        >
          {children}
        </Col>
      </Row>
    );
  }
  return <LoadItem title="Você não tem permissão para acessar essa página" />;
};

export default PageDefault;
