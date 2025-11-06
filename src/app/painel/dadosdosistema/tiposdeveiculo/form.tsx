// react libraries
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, Input, Modal, Row, message } from "antd";

// services
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, cleanData } from "../../../../services";

// components
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
import { TableReturnButton } from "../../../../components/Table/buttons";

const VehicleTypeForm = ({ type, path, permission }: PageDefaultProps) => {
  
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // state
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);

  // form
  const [form] = Form.useForm();

  // valid params
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/${path}/${ID}`).then((rs) => {
        if (rs.ok) return rs.json();
        else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }).then((res) => {
        form.setFieldsValue(cleanData(res.data));
      }).catch(POST_CATCH).finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // function save
  const onSend = (values: any) => {
    setLoadButton(true);
    POST_API(`/${path}`, values, ID).then((rs) => {
      if (rs.ok) return rs.json();
      else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
    }).then((data) => {
      message.success("Salvo com sucesso!");
      navigate("..");
    }).catch(POST_CATCH).finally(() => setLoadButton(false));
  };

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
      { title: <Link to={type === "list" ? "#" : ".."}>Tipos de Veículos</Link> },
      { title: type === "add" ? "Novo" : "Editar" },
    ]} options={
      <Row justify={"end"} gutter={[8, 8]}>
        <TableReturnButton type={type} permission={permission} />
      </Row>
    }>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Form layout="vertical" form={form} onFinish={onSend}>
                <Row gutter={[8, 8]}>
                  <Col xs={24} md={24}>
                    <Form.Item name="name" label="Tipo" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input placeholder="Tipo" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button  htmlType="submit" type="primary" style={{ float: "right", marginLeft: 6 }} loading={loadButton}>
                      Salvar
                    </Button>
                    <Link to={".."}>
                      <Button  type="default" style={{ float: "right" }}>
                        Cancelar
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Form>
            </CardItem>
          )}
        </Col>
      </Row>
    </PageDefault>
  );
};

export default VehicleTypeForm;
