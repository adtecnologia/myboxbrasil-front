/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  message,
  Radio,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// components
import LoadItem from "@/components/LoadItem";
import SelectSearch from "@/components/SelectSearch";
// services
import {
  cleanData,
  GET_API,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from "@/services";

interface StationaryBucketFormProps
  extends Omit<PageDefaultProps, "permission"> {
  nextTab: () => void;
}

const StationaryBucketForm = ({
  type,
  path,
  nextTab,
}: StationaryBucketFormProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // PARAMETROS
  const { ID } = useParams();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [typeLocal, setTypeLocal] = useState<string>("B");
  const [residue, setResidue] = useState<any>([]);
  const [residueSelect, setResidueSelect] = useState<any[]>([]);
  const [loadResidue, setLoadResidue] = useState<boolean>(true);

  // CAMPOS FORMULARIO
  const [form] = Form.useForm();

  // VERIFICA "NOVO" OU "EDITAR"
  useEffect(() => {
    renderResidue();
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
          for (const item of res.data.residues) {
            if (residueSelect.indexOf(item.id) === -1) {
              residueSelect.push(item.id);
            }
          }

          setTypeLocal(res.data.type_local);
          setModel({ ID: res.data.stationary_bucket_type_id });
        })
        .catch(() => {
          POST_CATCH();
        })
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // CARREGA RESIDUOS
  const renderResidue = () => {
    setLoadResidue(true);
    GET_API("/me")
      .then((rs) => rs.json())
      .then((res) => {
        GET_API("/residue_user/" + res.data.id)
          .then((rs) => rs.json())
          .then((res) => {
            setResidue(res.data);
          })
          .catch(POST_CATCH)
          .finally(() => setLoadResidue(false));
      })
      .catch(POST_CATCH);
  };

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    if (!(residueSelect.length > 0)) {
      message.warning("Por favor selecione pelo menos um resíduo.");
      return;
    }
    setLoadButton(true);
    values.residues = residueSelect;
    POST_API(`/${path}`, values, ID)
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

  const onResidue = (value: any, item: any) => {
    const temp = residueSelect;
    if (temp.includes(item.id)) {
      temp.splice(temp.indexOf(item.id), 1);
    } else {
      temp.push(item.id);
    }
    setResidueSelect(temp);
  };

  if (load) {
    return <LoadItem type="alt" />;
  }

  return (
    <Form form={form} layout="vertical" onFinish={onSend}>
      <Row gutter={[8, 8]}>
        <Col md={6} xs={10}>
          <Form.Item
            label="Modelo"
            name="stationary_bucket_type_id"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <SelectSearch
              change={(v: any) => {
                form.setFieldValue("stationary_bucket_type_id", v.value);
              }}
              effect={model}
              labelField="name"
              placeholder="Modelo"
              url="/stationary_bucket_type"
              value={form.getFieldValue("stationary_bucket_type_id")}
            />
          </Form.Item>
        </Col>
        <Col md={3} xs={14}>
          <Form.Item
            label="Material"
            name="material"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Input placeholder="Material" />
          </Form.Item>
        </Col>
        <Col md={3} xs={10}>
          <Form.Item
            label="Peso"
            name="weight"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Input
              addonAfter="kg"
              placeholder="Peso"
              style={{ width: "100%" }}
              type="number"
            />
          </Form.Item>
        </Col>
        <Col md={4} xs={24}>
          <Form.Item
            label="Cores"
            name="color"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Input placeholder="Cores" />
          </Form.Item>
        </Col>
        <Col md={8} xs={24}>
          <Form.Item
            label="Tipo de Tampa"
            name="type_lid"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Radio.Group>
              <Radio value={"A"}>Tampa Articulada</Radio>
              <Radio value={"C"}>Tampa Corrediça</Radio>
              <Radio value={"S"}>Sem Tampa</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col md={4} xs={24}>
          <Form.Item
            label="Tipo de Locação"
            name="type_local"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Select onChange={setTypeLocal}>
              <Select.Option value={"B"}>Externa e Interna</Select.Option>
              <Select.Option value={"E"}>Somente Externa</Select.Option>
              <Select.Option value={"I"}>Somente Interna</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        {typeLocal === "B" || typeLocal === "E" ? (
          <>
            <Col md={4} xs={10}>
              <Form.Item
                label="Dias Locação Externa"
                name="days_external"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input
                  min={1}
                  placeholder="Dias Locação Externa"
                  type="number"
                />
              </Form.Item>
            </Col>
            <Col md={4} xs={14}>
              <Form.Item
                label="Preço Locação Externa"
                name="price_external"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <InputNumber
                  addonBefore="R$"
                  min={1}
                  placeholder="Preço Locação Externa"
                  step={"0.01"}
                  style={{ width: "100%" }}
                  type="number"
                />
              </Form.Item>
            </Col>
          </>
        ) : null}
        {typeLocal === "B" || typeLocal === "I" ? (
          <>
            <Col md={4} xs={10}>
              <Form.Item
                label="Dias Locação Interna"
                name="days_internal"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input
                  min={1}
                  placeholder="Dias Locação Interna"
                  type="number"
                />
              </Form.Item>
            </Col>
            <Col md={4} xs={14}>
              <Form.Item
                label="Preço Locação Interna"
                name="price_internal"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <InputNumber
                  addonBefore="R$"
                  min={1}
                  placeholder="Preço Locação Interna"
                  step={"0.01"}
                  style={{ width: "100%" }}
                  type="number"
                />
              </Form.Item>
            </Col>
          </>
        ) : null}
        <Col span={24}>
          <Form.Item label="Resíduos">
            {loadResidue || load ? (
              <LoadItem type="alt" />
            ) : residue.length > 0 ? (
              <List
                dataSource={residue}
                itemLayout="horizontal"
                renderItem={(item: any) => (
                  <List.Item
                    actions={[
                      <Switch
                        defaultChecked={residueSelect.includes(item.id)}
                        onChange={(v) => onResidue(v, item)}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      description={item.description}
                      title={item.name}
                    />
                  </List.Item>
                )}
                size="small"
              />
            ) : (
              <Typography>
                Nenhum resíduo cadastrado.{" "}
                <Link target="_blank" to="/painel/configuracoes">
                  Cadastre aqui!
                </Link>
              </Typography>
            )}
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

export default StationaryBucketForm;
