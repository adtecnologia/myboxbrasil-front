/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CardItem from "@/components/CardItem";
import LoadItem from "@/components/LoadItem";
import PageDefault from "@/components/PageDefault";
import StatisticComponent from "@/components/StatisticComponent";
import { GET_API } from "@/services";

export default function RelatorioSituacaoDestinoFinal() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);

  // form
  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);

    let url = `/reports/destination-situation?page=${current}&per_page=${page}`;

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) {
        url += `&${key}=${value}`;
      }
    }

    GET_API(url).then((response) => {
      if (!response.ok) {
        Modal.warning({ title: "Algo deu errado" });
        return;
      }
      response.json().then((res) => {
        setData(res.data);
        setTotal(res.meta.total);
        setLoad(false);
      });
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignorar
  useEffect(() => {
    form.setFieldValue("order_by", "total_orders");
    onSend({ order_by: "total_orders" });
  }, []);

  return (
    <PageDefault
      items={[{ title: "Relatório" }, { title: "Situação Destino Final" }]}
      valid={"rpt.eml"}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <CardItem>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSend}
              style={{ width: "100%" }}
            >
              <Row align={"bottom"} gutter={[8, 16]}>
                <Col lg={4} md={5} xl={3} xs={24}>
                  <Form.Item
                    label="Situação"
                    name="municipal_approval_status"
                    style={{ marginBottom: 0 }}
                  >
                    <Select allowClear placeholder="Situação">
                      <Select.Option value="waiting">Aguardando</Select.Option>
                      <Select.Option value="rejected">Rejeitado</Select.Option>
                      <Select.Option value="accepted">Aceito</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={17} md={15} xl={19} xs={24}>
                  <Form.Item
                    label="Pesquisar"
                    name="search"
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Pesquisar destinador final..." />
                  </Form.Item>
                </Col>
                <Col lg={3} md={4} xl={2} xs={24}>
                  <Button block htmlType="submit" loading={load} type="primary">
                    Filtrar
                  </Button>
                </Col>
              </Row>
            </Form>
          </CardItem>
        </Col>
        {load && (
          <Col span={24}>
            <CardItem>
              <LoadItem type="alt" />
            </CardItem>
          </Col>
        )}
        {!load && data.length === 0 && (
          <Col span={24}>
            <CardItem>
              <Typography>Nenhum registro encontrado</Typography>
            </CardItem>
          </Col>
        )}
        {!load &&
          data.length > 0 &&
          data.map((item: any) => (
            <Col key={item} span={24}>
              <CardItem>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Typography
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "var(--color03)",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Col>
                  <Col lg={8} md={12} xl={8} xs={12}>
                    <StatisticComponent
                      title={String(item.document_type).toLocaleUpperCase()}
                      value={item.document_number}
                    />
                  </Col>
                  <Col lg={8} md={12} xl={8} xs={12}>
                    <StatisticComponent title="E-mail" value={item.email} />
                  </Col>
                  <Col lg={6} md={12} xl={6} xs={12}>
                    <StatisticComponent
                      title="Contato"
                      value={`${item.phone ?? "-"} / ${item.secondary_phone ?? "-"}`}
                    />
                  </Col>
                  <Col md={24} xs={24}>
                    <StatisticComponent
                      title="Endereço"
                      value={`
                          ${item.address.street}, nº${item.address.number} -
                          ${item.address.district} - ${item.address.zip_code}
                        `}
                    />
                  </Col>
                  <Col md={16} xs={24}>
                    <StatisticComponent
                      title="Licença ambiental"
                      value={
                        item?.environmental_license ? (
                          <Link target="_blank" to={item.environmental_license}>
                            {item.environmental_license}
                          </Link>
                        ) : (
                          <Typography>-</Typography>
                        )
                      }
                    />
                  </Col>
                  <Col md={4} xs={24}>
                    <StatisticComponent
                      title="Validade"
                      value={
                        <Typography>
                          {item?.environmental_license_expiration
                            ? item.environmental_license_expiration_format
                            : "-"}
                        </Typography>
                      }
                    />
                  </Col>
                  <Col md={4} xs={24}>
                    <StatisticComponent
                      title="Situação"
                      value={
                        <Tag
                          color={item.municipal_approval_status.color}
                          style={{ width: "100%", marginTop: 4 }}
                        >
                          {item.municipal_approval_status.name}
                        </Tag>
                      }
                    />
                  </Col>
                </Row>
              </CardItem>
            </Col>
          ))}
        <Col span={24}>
          <CardItem>
            <Row justify={"space-between"}>
              <InputNumber
                defaultValue={page}
                max={100}
                min={1}
                onBlur={(v: any) =>
                  setPage(
                    v.target.value > 0 && v.target.value <= 100
                      ? v.target.value
                      : 10
                  )
                }
                size="small"
                style={{ width: 150, textAlign: "right" }}
                suffix=" / página"
              />
              <Pagination
                current={current}
                defaultCurrent={current}
                onChange={(newPage, size) => {
                  setCurrent(newPage);
                  setPage(size);
                }}
                pageSize={page}
                showSizeChanger={false}
                size="small"
                total={total}
              />
            </Row>
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
}
