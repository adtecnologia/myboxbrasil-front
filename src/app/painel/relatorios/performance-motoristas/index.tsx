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
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import { TbClock, TbRoute, TbTruckDelivery } from "react-icons/tb";
import CardItem from "@/components/CardItem";
import CardKPI from "@/components/CardKPISmall";
import LoadItem from "@/components/LoadItem";
import PageDefault from "@/components/PageDefault";
import { GET_API } from "@/services";

export default function RelatorioPerformanceMotoristas() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);

  // form
  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);

    let url = `/reports/ranking-drivers?page=${current}&per_page=${page}`;

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
    form.setFieldValue("order_by", "total_delivery");
    onSend({ order_by: "total_delivery" });
  }, []);

  return (
    <PageDefault
      items={[{ title: "Relatório" }, { title: "Performance de motoristas" }]}
      valid={"rpt.pmt"}
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
                <Col lg={17} md={15} xl={18} xs={24}>
                  <Form.Item
                    label="Pesquisar"
                    name="search"
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Pesquise aqui..." />
                  </Form.Item>
                </Col>
                <Col lg={4} md={5} xl={4} xs={24}>
                  <Form.Item
                    label="Ordenar por"
                    name="order_by"
                    style={{ marginBottom: 0 }}
                  >
                    <Select>
                      <Select.Option value="-total_delivery">
                        Mais entregas realizadas
                      </Select.Option>
                      <Select.Option value="total_delivery">
                        Menos entregas realizadas
                      </Select.Option>
                      <Select.Option value="-total_withdrawal">
                        Mais retiradas realizadas
                      </Select.Option>
                      <Select.Option value="total_withdrawal">
                        Menos retiradas realizadas
                      </Select.Option>
                      <Select.Option value="-total_late">
                        Mais atrasos
                      </Select.Option>
                      <Select.Option value="total_late">
                        Menos atrasos
                      </Select.Option>
                      <Select.Option value="-total_reports">
                        Maior número de ocorrências
                      </Select.Option>
                      <Select.Option value="total_reports">
                        Menor número de ocorrências
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
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <Typography
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "var(--color03)",
                      }}
                    >
                      {item.driver_name}
                    </Typography>
                    <Typography>E-mail: {item.email}</Typography>
                    <Typography>
                      Contato: {item.phone ?? "-"} /{" "}
                      {item.secondary_phone ?? "-"}
                    </Typography>
                  </Col>
                  <Col lg={6} md={12} xl={6} xs={12}>
                    <CardKPI
                      icon={
                        <TbTruckDelivery color="var(--color02)" size={40} />
                      }
                      title="Entregas realizadas"
                      type="black"
                      value={item.total_delivery}
                    />
                  </Col>
                  <Col lg={6} md={12} xl={6} xs={12}>
                    <CardKPI
                      icon={
                        <TbTruckDelivery color="var(--color02)" size={40} />
                      }
                      title="Retiradas realizadas"
                      type="black"
                      value={item.total_withdrawal}
                    />
                  </Col>
                  <Col lg={4} md={12} xl={4} xs={12}>
                    <CardKPI
                      icon={
                        <LuTriangleAlert color="var(--color02)" size={40} />
                      }
                      title="Ocorrências"
                      type="black"
                      value={item.total_reports}
                    />
                  </Col>
                  <Col lg={4} md={12} xl={4} xs={12}>
                    <CardKPI
                      icon={<TbClock color="var(--color02)" size={40} />}
                      title="Atrasos"
                      type="black"
                      value={item.total_late}
                    />
                  </Col>
                  <Col lg={4} md={12} xl={4} xs={12}>
                    <CardKPI
                      icon={<TbRoute color="var(--color02)" size={40} />}
                      title="Quilometragem"
                      type="black"
                      value={item.kilometragem}
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
