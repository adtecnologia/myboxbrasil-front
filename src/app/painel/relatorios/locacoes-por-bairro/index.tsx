/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Progress,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import CardItem from '@/components/CardItem';
import LoadItem from '@/components/LoadItem';
import PageDefault from '@/components/PageDefault';
import { GET_API } from '@/services';

export default function RelatorioLocacoesPorBairro() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);

  // form
  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);

    let url = `/reports/locations-by-district?page=${current}&per_page=${page}&sort=-order_locations.created_at`;

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) {
        url += `&${key}=${value}`;
      }
    }

    GET_API(url).then((response) => {
      if (!response.ok) {
        Modal.warning({ title: 'Algo deu errado' });
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
    onSend({});
  }, []);

  return (
    <PageDefault
      items={[{ title: 'Relatório' }, { title: 'Caçambas por bairro' }]}
      valid={'rpt.cpb'}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <CardItem>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSend}
              style={{ width: '100%' }}
            >
              <Row align={'bottom'} gutter={[8, 16]}>
                <Col lg={4} md={5} xl={3} xs={12}>
                  <Form.Item
                    label="Data início"
                    name="start_date"
                    style={{ marginBottom: 0 }}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col lg={4} md={5} xl={3} xs={12}>
                  <Form.Item
                    label="Data final"
                    name="end_date"
                    style={{ marginBottom: 0 }}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col lg={13} md={10} xl={16} xs={24}>
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
                <Row gutter={[8, 8]}>
                  <Col flex={'60px'}>
                    <Tooltip
                      title={`${Number((item.concluidas / item.total) * 100).toFixed(2)}%`}
                    >
                      <Progress
                        percent={100}
                        showInfo={false}
                        size={50}
                        strokeColor={'#e97a13ff'}
                        strokeWidth={10}
                        style={{ width: '100%' }}
                        success={{
                          percent: (item.concluidas / item.total) * 100,
                        }}
                        trailColor="green"
                        type="circle"
                      />
                    </Tooltip>
                  </Col>
                  <Col flex={'auto'}>
                    <Typography
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: 'var(--color03)',
                      }}
                    >
                      {item.client_district} - {item.city_name}
                    </Typography>
                    <Typography>
                      <b>Locações em andamento:</b> {item.em_andamento}
                    </Typography>
                    <Typography>
                      <b>Locações concluídas:</b> {item.concluidas}
                    </Typography>
                    <Typography>
                      <b>Primeira locação:</b> {item.first_date}
                    </Typography>
                    <Typography>
                      <b>Última locação:</b> {item.last_date}
                    </Typography>
                  </Col>
                </Row>
              </CardItem>
            </Col>
          ))}
        <Col span={24}>
          <CardItem>
            <Row justify={'space-between'}>
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
                style={{ width: 150, textAlign: 'right' }}
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
