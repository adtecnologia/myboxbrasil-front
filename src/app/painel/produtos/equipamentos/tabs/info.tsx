/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadItem from "@/components/LoadItem";
import LexicalComponent from "@/components/lexical-component";
import SelectSearch from "@/components/SelectSearch";
// services
import {
  cleanData,
  GET_API,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from "@/services";

interface EquipmentFormProps extends Omit<PageDefaultProps, "permission"> {
  nextTab: () => void;
}

const EquipmentForm = ({ type, path, nextTab }: EquipmentFormProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // PARAMETROS
  const { ID } = useParams();

  // ESTADOS DO COMPONENTE

  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [model, setModel] = useState<any>(null);

  // CAMPOS FORMULARIO
  const [form] = Form.useForm();

  // VALORES DOS LEXICAL COMPONENTS
  const [descriptionValue, setDescriptionValue] = useState("");
  const [operationalOrientationValue, setOperationalOrientationValue] =
    useState("");
  const [securityOrientationValue, setSecurityOrientationValue] = useState("");

  // VERIFICA "NOVO" OU "EDITAR"
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/${path}/${ID}`)
        .then((rs) => {
          if (!rs.ok) {
            Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          }
          return rs.json();
        })
        .then((res) => {
          form.setFieldsValue(cleanData(res.data));

          setDescriptionValue(res.data.description || "");
          setOperationalOrientationValue(
            res.data.operational_orientation || ""
          );
          setSecurityOrientationValue(res.data.security_orientation || "");

          setModel({ ID: res.data.equipment_type_id });
        })
        .catch(() => {
          POST_CATCH();
        })
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    setLoadButton(true);

    // Incluir valores dos editors Lexical
    const payload = {
      ...values,
      description: descriptionValue,
      operational_orientation: operationalOrientationValue,
      security_orientation: securityOrientationValue,
    };

    POST_API(`/${path}`, payload, ID)
      .then(async (rs) => {
        if (rs.ok) {
          const response = await rs.json();

          message.success("Salvo com sucesso!");

          if (type === "add") {
            navigate(`/painel/cacambas/${response.data?.id}`);
          } else {
            nextTab();
          }
        } else {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  if (load) {
    return <LoadItem type="alt" />;
  }

  return (
    <Form form={form} layout="vertical" onFinish={onSend}>
      <Row gutter={[8, 0]}>
        <Col md={6} xs={24}>
          <Form.Item
            label="Tipo de equipamento"
            name="equipment_type_id"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <SelectSearch
              change={(v: any) => {
                form.setFieldValue("equipment_type_id", v.value);
              }}
              effect={model}
              labelField="name"
              placeholder="Tipo de equipamento"
              url="/equipment-type"
              value={form.getFieldValue("equipment_type_id")}
            />
          </Form.Item>
        </Col>
        <Col md={18} xs={24}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Input placeholder="Nome" />
          </Form.Item>
        </Col>
        <Col md={6} xs={12}>
          <Form.Item
            label="Preço diário"
            name="rental_price_day"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <InputNumber
              addonBefore="R$"
              min={1}
              placeholder="Preço diário"
              step={"0.01"}
              style={{ width: "100%" }}
              type="number"
            />
          </Form.Item>
        </Col>
        <Col md={6} xs={12}>
          <Form.Item
            label="Preço semanal"
            name="rental_price_week"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <InputNumber
              addonBefore="R$"
              min={1}
              placeholder="Preço semanal"
              step={"0.01"}
              style={{ width: "100%" }}
              type="number"
            />
          </Form.Item>
        </Col>
        <Col md={6} xs={12}>
          <Form.Item
            label="Preço quinzenal"
            name="rental_price_fortnight"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <InputNumber
              addonBefore="R$"
              min={1}
              placeholder="Preço quinzenal"
              step={"0.01"}
              style={{ width: "100%" }}
              type="number"
            />
          </Form.Item>
        </Col>
        <Col md={6} xs={12}>
          <Form.Item
            label="Preço mensal"
            name="rental_price_month"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <InputNumber
              addonBefore="R$"
              min={1}
              placeholder="Preço mensal"
              step={"0.01"}
              style={{ width: "100%" }}
              type="number"
            />
          </Form.Item>
        </Col>
        <Col md={24} xs={24}>
          <Form.Item label="Descrição" name="description">
            <LexicalComponent
              onChange={setDescriptionValue}
              value={descriptionValue}
            />
          </Form.Item>
        </Col>
        <Col md={24} xs={24}>
          <Form.Item
            label="Orientações de operação"
            name="operational_orientation"
          >
            <LexicalComponent
              onChange={setOperationalOrientationValue}
              value={operationalOrientationValue}
            />
          </Form.Item>
        </Col>
        <Col md={24} xs={24}>
          <Form.Item
            label="Orinetações de segurança"
            name="security_orientation"
          >
            <LexicalComponent
              onChange={setSecurityOrientationValue}
              value={securityOrientationValue}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Button
            htmlType="submit"
            loading={loadButton}
            shape="round"
            style={{ float: "right", marginLeft: 6 }}
            type="primary"
          >
            Salvar e avançar
          </Button>
          <Link to={".."}>
            <Button shape="round" style={{ float: "right" }} type="default">
              Cancelar
            </Button>
          </Link>
        </Col>
      </Row>
    </Form>
  );
};

export default EquipmentForm;
