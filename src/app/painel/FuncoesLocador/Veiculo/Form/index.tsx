// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, Input, Modal, Row, Select, message } from "antd";

// SERVIÇOS
import {
    GET_API,
  POST_API,
  POST_CATCH,
  PageDefaultProps,
  getToken,
} from "../../../../../services";

// COMPONENTES
import PageDefault from "../../../../../components/PageDefault";
import CardItem from "../../../../../components/CardItem";
import LoadItem from "../../../../../components/LoadItem";
import { TableReturnButton } from "../../../../../components/Table/buttons";
import SelectSearch from "../../../../../components/SelectSearch";
import { InputMaskCorrect } from "../../../../../components/InputMask";

const VeiculoForm = ({ type, path, permission }: PageDefaultProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // PARAMETROS
  const { ID } = useParams();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [vehicleType, setVehicleType] = useState<any>(null);

  // CAMPOS FORMULARIO
  const [form] = Form.useForm();

  // ANOS
  const years = Array.from(
    { length: 30 },
    (_, index) => new Date().getFullYear() + 2 - index
  );

  // VERIFICA "NOVO" OU "EDITAR"
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/vehicle/${ID}`)
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        } else {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
      })
      .then((res) => {
        setVehicleType({ ID: res.data.vehicle_type_id });
        form.setFieldsValue(res.data);
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    console.log(values)
    setLoadButton(true);
    POST_API(`/vehicle`, values, ID)
      .then((rs) => {
        if (rs.ok) {
            message.success("Salvo com sucesso!");
            navigate("..");
        } else {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));    
  };

  return (
    <PageDefault
      valid={`${permission}.${type}`}
      items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Veículos</Link> },
        { title: type === "add" ? "Novo" : "Editar" },
      ]}
      options={
        <Row justify={"end"} gutter={[8, 8]}>
          <TableReturnButton type={type} permission={permission} />
        </Row>
      }
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Form layout="vertical" form={form} onFinish={onSend}>
                <Row gutter={[8, 8]}>
                  <Col xs={10} md={6}>
                    <Form.Item
                      name="vehicle_type_id"
                      label="Tipo de Veículo"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <SelectSearch
                        placeholder="Tipo de Veículo"
                        effect={vehicleType}
                        value={form.getFieldValue("vehicle_type_id")}
                        url="/vehicle_type"
                        labelField={["id", "name"]}
                        change={(v: any) =>
                          form.setFieldValue("vehicle_type_id", v?.value)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item
                      name="plate"
                      label="Placa"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Placa" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item
                      name="renavam"
                      label="Renavam"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Renavam" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item
                      name="brand"
                      label="Marca"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Marca" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item
                      name="model"
                      label="Modelo"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Modelo" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name="version" label="Versão">
                      <Input placeholder="Versão" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item
                      name="year_manufacture"
                      label="Ano Fabricação"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"9999"}>
                        { () => <Input placeholder="Ano Fabricação"/> }
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item
                      name="year_model"
                      label="Ano Modelo"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"9999"}>
                        { () => <Input placeholder="Ano Modelo"/> }
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={5}>
                    <Form.Item
                      name="fuel"
                      label="Combustível"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input type="text" placeholder="Combustível" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name="motor" label="Motor">
                      <Input placeholder="Motor" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name="axles" label="Eixos">
                      <Input placeholder="Eixos" type="number" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name="capacity" label="Lotação">
                      <Input
                        addonAfter="t"
                        placeholder="Lotação"
                        style={{ width: "100%" }}
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name="total_gross_weight" label="Tara">
                      <Input
                        addonAfter="t"
                        placeholder="Tara"
                        style={{ width: "100%" }}
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button
                      shape="round"
                      htmlType="submit"
                      type="primary"
                      style={{ float: "right", marginLeft: 6 }}
                      loading={loadButton}
                    >
                      Salvar
                    </Button>
                    <Link to={".."}>
                      <Button
                        shape="round"
                        type="default"
                        style={{ float: "right" }}
                      >
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

export default VeiculoForm;
