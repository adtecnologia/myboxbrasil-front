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

export default function RelatorioVencimentoPrazo() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);

  // form
  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);

    let url = `/reports/expiration-date?page=${current}&per_page=${page}`;

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
    form.setFieldValue("order_by", "expiration_date");
    onSend({ order_by: "expiration_date" });
  }, [current]);

  return (
    <PageDefault
      items={[{ title: "Relatório" }, { title: "Vencimento de prazo" }]}
      valid={"rpt.vdp"}
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
                <Col lg={4} md={8} xl={3} xs={12}>
                  <Form.Item
                    label="Data locação início"
                    name="start_date"
                    style={{ marginBottom: 0 }}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col lg={4} md={8} xl={3} xs={12}>
                  <Form.Item
                    label="Data locação final"
                    name="end_date"
                    style={{ marginBottom: 0 }}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col lg={9} md={20} xl={12} xs={24}>
                  <Form.Item
                    label="Pesquisar"
                    name="search"
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Pesquisar locação..." />
                  </Form.Item>
                </Col>
                <Col lg={4} md={8} xl={4} xs={24}>
                  <Form.Item
                    label="Ordenar por"
                    name="order_by"
                    style={{ marginBottom: 0 }}
                  >
                    <Select>
                      <Select.Option value="expiration_date">
                        Menor data vencimento
                      </Select.Option>
                      <Select.Option value="-expiration_date">
                        Maior data vencimento
                      </Select.Option>
                      <Select.Option value="client_district">
                        Bairro A-Z
                      </Select.Option>
                      <Select.Option value="-client_district">
                        Bairro Z-A
                      </Select.Option>
                    </Select>
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
                  <Col lg={2} md={3} xl={2} xs={12}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Cor"
                      value={item.group_color}
                    />
                  </Col>
                  <Col lg={2} md={3} xl={2} xs={12}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Material"
                      value={item.group_material}
                    />
                  </Col>
                  <Col lg={20} md={18} xl={20} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Locador"
                      value={item.provider_name}
                    />
                  </Col>
                  <Col lg={3} md={4} xl={3} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Data locação"
                      value={item.location_date}
                    />
                  </Col>
                  <Col lg={21} md={20} xl={21} xs={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Locatário"
                      value={item.client_name}
                    />
                  </Col>
                  <Col span={24}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Endereço locação"
                      value={`${item.client_street} ${item.client_number} - ${item.client_district}`}
                    />
                  </Col>
                  <Col lg={4} md={5} xl={4} xs={12}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Data de vencimento"
                      value={item.expiration_date}
                    />
                  </Col>
                  <Col lg={4} md={5} xl={4} xs={12}>
                    <Statistic
                      style={{ fontSize: 10 }}
                      title="Dias de atraso"
                      value={Number(item.days_late).toFixed(0)}
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
