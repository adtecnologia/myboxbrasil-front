// BIBLIOTECAS REACT

import { Col, List, Row, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import { Link } from "react-router-dom";
import { GET_API } from "../../services";

// INTERFACE
interface GraphUltimosPedidosInterface {
  height?: string;
}

// CSS
import "./styles.css";

const GraphUltimosPedidos = ({ height }: GraphUltimosPedidosInterface) => {
  // ESTADOS DO COMPONENTE
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);

  // CARREGA PEDIDOS
  useEffect(() => {
    setLoading(true);
    GET_API(
      "/order_location?page=1&per_page=6&sort=-order_locations.created_at"
    )
      .then((rs) => rs.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ height, overflow: "hidden" }}>
      <List
        dataSource={data}
        locale={{ emptyText: "Nenhum dado encontrado" }}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <Row
              align={"middle"}
              justify={"space-between"}
              style={{ width: "100%" }}
            >
              <Col>
                <Link to={`/painel/pedircacamba/cacamba/${item.product.id}`}>
                  <Typography className="dsh-item-link">
                    Modelo {item.product.stationary_bucket_type.name} - Cor:{" "}
                    {item.product.color}
                  </Typography>
                </Link>
              </Col>
              <Col>
                <Tag color={item.status.color}>{item.created_at}</Tag>
              </Col>
            </Row>
          </List.Item>
        )}
      />
      {loading ? (
        <Row
          align={"middle"}
          className="loading-graph"
          justify={"center"}
          style={{ height: "90%" }}
        >
          <Oval
            ariaLabel="oval-loading"
            color="var(--color01)"
            height="50"
            secondaryColor="var(--color01)"
            visible={true}
            width="50"
            wrapperClass=""
            wrapperStyle={{}}
          />
        </Row>
      ) : null}
    </div>
  );
};

export default GraphUltimosPedidos;
