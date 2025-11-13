/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  message,
  Row,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatisticComponent from "@/components/StatisticComponent";
import { MAX_UPLOAD_FILE } from "@/utils/max-file-upload";
// components
import CardItem from "../../../components/CardItem";
// services
import {
  GET_API,
  getUPLOADAPI,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from "../../../services";

const EnvironmentalLicense = () => {
  // state
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setIsSending(true);
    const payload = {
      ...values,
      environmental_license: values.environmental_license?.file?.response?.url,
    };
    POST_API("/me", payload)
      .then((rs) => {
        if (rs.ok) {
          message.success("Licença atualizada!");
          onView();
          setOpen(false);
          form.resetFields();
        } else {
          Modal.error({ title: "Algo deu errado", content: rs.statusText });
        }
      })
      .finally(() => setIsSending(false));
  };

  const onView = () => {
    GET_API("/me")
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((res) => {
        setData(res.data);
      })
      .catch(POST_CATCH);
  };

  useEffect(() => {
    onView();
  }, []);

  return (
    <CardItem
      option={
        verifyConfig(["conf.lcs.edit"]) && (
          <Button
            className="btn-primary"
            onClick={() => setOpen(true)}
            size="small"
            style={{ float: "right" }}
            type="primary"
          >
            Atualizar licença
          </Button>
        )
      }
      title="Licença ambiental"
    >
      <Row gutter={[8, 8]}>
        <Col md={18} xs={24}>
          <StatisticComponent
            title="Licença ambiental"
            value={
              data?.environmental_license ? (
                <Link target="_blank" to={data.environmental_license}>
                  {data.environmental_license}
                </Link>
              ) : (
                <Typography>-</Typography>
              )
            }
          />
        </Col>
        <Col md={6} xs={24}>
          <StatisticComponent
            title="Validade"
            value={
              <Typography>
                {data?.environmental_license_expiration
                  ? data.environmental_license_expiration_format
                  : "-"}
              </Typography>
            }
          />
        </Col>
      </Row>
      {Boolean(data?.address?.city?.municipal_approval) &&
        data?.municipal_approval_status.name !== "Aprovado" && (
          <Alert
            message={
              data?.municipal_approval_status?.name === "Rejeitado"
                ? `Sua conta foi recusada! Verifique os dados e envie novamente para aprovação. Motivo: ${data?.municipal_approved_reason}`
                : "Sua conta está em processo de aprovação na prefeitura. Alguns recursos podem estar limitados."
            }
            style={{ marginTop: 10 }}
            type={
              data?.municipal_approval_status?.name === "Rejeitado"
                ? "error"
                : "warning"
            }
          />
        )}
      <Modal
        cancelText="Cancelar"
        okButtonProps={{ loading: isSending }}
        okText="Enviar"
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        open={open}
        title="Atualizar licença ambiental"
      >
        <Form form={form} layout="vertical" onFinish={onSend}>
          <Form.Item
            label="Licença ambiental"
            name="environmental_license"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Upload
              accept="application/pdf"
              action={getUPLOADAPI}
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                const isLt5M = file.size / 1024 / 1024 < MAX_UPLOAD_FILE;

                if (!isPDF) {
                  message.error("Apenas arquivos PDF são permitidos.");
                  return Upload.LIST_IGNORE; // <- não envia
                }

                if (!isLt5M) {
                  message.error(
                    "Tamanho do arquivo maior do que o permitido (5MB)."
                  );
                  return Upload.LIST_IGNORE; // <- não envia
                }
              }}
              maxCount={1}
              showUploadList={true}
            >
              <Button
                block
                className="btn-default"
                shape="round"
                type="default"
              >
                Anexar licença
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Validade"
            name="environmental_license_expiration"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <Input placeholder="Validade" type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </CardItem>
  );
};

export default EnvironmentalLicense;
