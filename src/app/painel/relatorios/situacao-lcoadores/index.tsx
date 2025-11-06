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
} from 'antd';
import { useEffect, useState } from 'react';
import CardItem from '@/components/CardItem';
import LoadItem from '@/components/LoadItem';
import PageDefault from '@/components/PageDefault';
import { GET_API } from '@/services';

export default function RelatorioSituacaoLocadores() {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);

  // form
  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);

    let url = `/reports/seller-situation?page=${current}&per_page=${page}`;

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
    form.setFieldValue('order_by', 'total_orders');
    onSend({ order_by: 'total_orders' });
  }, []);

  return (
    <PageDefault
      items={[{ title: 'Relatório' }, { title: 'Situação Locadores' }]}
      valid={'rpt.eml'}
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
                <Col lg={4} md={5} xl={3} xs={24}>
                  <Form.Item
                    label="Ordenar por"
                    name="order_by"
                    style={{ marginBottom: 0 }}
                  >
                    <Select>
                      <Select.Option value="total_orders">
                        Total locações
                      </Select.Option>
                      <Select.Option value="total_faturado">
                        Faturamento
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={17} md={15} xl={19} xs={24}>
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
                  <Col span={24}>
                    <Typography
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: 'var(--color03)',
                      }}
                    >
                      {item.client_name}
                    </Typography>
                    <Typography>E-mail: {item.client_email}</Typography>
                    <Typography>
                      Contato: {item.client_phone ?? '-'} /{' '}
                      {item.client_secondary_phone ?? '-'}
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
