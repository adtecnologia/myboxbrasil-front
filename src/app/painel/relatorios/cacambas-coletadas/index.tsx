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
  Statistic,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import CardItem from "@/components/CardItem";
import LoadItem from "@/components/LoadItem";
import PageDefault from "@/components/PageDefault";
import { GET_API } from "@/services";

export default function RelatorioCacambasColetadas() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);

  // form
  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);

    let url = `/reports/residue-destination?page=${current}&per_page=${page}`;

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

  useEffect(() => {
    form.setFieldValue("order_by", "expiration_date");
    onSend({ order_by: "expiration_date" });
  }, [current]);

  return (
    <PageDefault
      items={[{ title: "Relatório" }, { title: "Destinação de Resíduos" }]}
      valid={"rpt.ddr"}
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
                <Col lg={4} md={12} xl={3} xs={12}>
                  <Form.Item
                    label="Situação MTR"
                    name="status_mtr"
                    style={{ marginBottom: 0 }}
                  >
                    <Select allowClear placeholder="Selecione...">
                      <Select.Option value={true}>Emitido</Select.Option>
                      <Select.Option value={false}>Não emitido</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={4} md={12} xl={3} xs={12}>
                  <Form.Item
                    label="Situação CDF"
                    name="status_cdf"
                    style={{ marginBottom: 0 }}
                  >
                    <Select allowClear placeholder="Selecione...">
                      <Select.Option value="DELIVERED">Emitido</Select.Option>
                      <Select.Option value="ONGOING">Não emitido</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={13} md={20} xl={16} xs={24}>
                  <Form.Item
                    label="Pesquisar"
                    name="search"
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Pesquise aqui..." />
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
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Typography
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "var(--color03)",
                      }}
                    >
                      {item.stationary_bucket_code} - Modelo {item.type_name}
                    </Typography>
                  </Col>
                  <Col lg={3} md={4} xl={3} xs={8}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Data coleta"
                      value={item.withdrawal_date}
                    />
                  </Col>
                  <Col lg={10} md={18} xl={10} xs={16}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Transportador"
                      value={item.driver_name}
                    />
                  </Col>
                  <Col lg={10} md={18} xl={10} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Locador"
                      value={item.provider_name}
                    />
                  </Col>
                  <Col lg={12} md={12} xl={12} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Locatário"
                      value={item.client_name}
                    />
                  </Col>
                  <Col lg={12} md={12} xl={12} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Destinador final"
                      value={item.destination_name}
                    />
                  </Col>
                  <Col lg={12} md={12} xl={12} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Origem"
                      value={`${item.client_street} ${item.client_number} - ${item.client_district}`}
                    />
                  </Col>
                  <Col lg={12} md={12} xl={12} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Destino"
                      value={`${item.final_destination_street} ${item.final_destination_number} - ${item.final_destination_district}`}
                    />
                  </Col>
                  <Col lg={4} md={5} xl={4} xs={12}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="MTR"
                      value={item.mtr ? "Emitido" : "Não emitido"}
                    />
                    <Button
                      disabled={!item.mtr}
                      onClick={() => window.open(item.mtr)}
                      type={item.mtr ? "primary" : "default"}
                    >
                      Visualizar
                    </Button>
                  </Col>
                  <Col lg={4} md={5} xl={4} xs={12}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="CDF"
                      value={item.cdf ? "Emitido" : "Não emitido"}
                    />
                    <Button
                      disabled={!item.cdf}
                      onClick={() => window.open(item.cdf)}
                      type={item.cdf ? "primary" : "default"}
                    >
                      Visualizar
                    </Button>
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
