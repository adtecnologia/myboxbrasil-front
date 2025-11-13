// react libraries

import { Col, Modal, Row, Segmented, Typography } from "antd";
import { useEffect, useState } from "react";
// components
import { RiFileReduceFill } from "react-icons/ri";
// services
import { GET_API, POST_API, POST_CATCH } from "../../../services";

const Period = () => {
  // state
  const [value, setValue] = useState();

  // function save
  const onChange = (use_periodic_payment: number) => {
    POST_API("/me", { use_periodic_payment })
      .then((rs) => {
        load();
        if (!rs.ok) {
          Modal.warning({
            title: "Algo deu errado",
            content: "Não foi possível atualizar opção.",
          });
        }
      })
      .catch(POST_CATCH);
  };

  // function load
  const load = () => {
    GET_API("/me")
      .then((rs) => rs.json())
      .then((res) => {
        setValue(res.data.use_periodic_payment);
      })
      .catch(POST_CATCH);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card-meta">
      <Row gutter={[12, 12]}>
        <Col flex={"auto"}>
          <Typography className="card-meta-title">
            Aceitar pagamentos no boletão?
          </Typography>
        </Col>
        <Col span={24}>
          <Row
            justify={"space-between"}
            style={{ flexWrap: "nowrap", width: "100%" }}
          >
            <Col>
              <Segmented
                {...{ value, onChange }}
                options={[
                  { value: 1, label: "Sim" },
                  { value: 0, label: "Não" },
                ]}
              />
            </Col>
            <Col>
              <RiFileReduceFill className="card-meta-icon" />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Period;
