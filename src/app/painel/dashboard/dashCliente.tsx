// react components

import { Col, FloatButton, List, Modal, Row, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
// icons
import {
  TbArchive,
  TbReport,
  TbShoppingCartPause,
  TbShoppingCartPin,
  TbShoppingCartPlus,
  TbTransformPointBottomLeft,
  TbTruckDelivery,
} from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import CardItem from '../../../components/CardItem';
import CardKPISmall from '../../../components/CardKPISmall';
import GraphCacambasPorMes from '../../../components/Graphics/graphCacambasPorMes';
import GraphUltimosPedidos from '../../../components/Graphics/graphUltimosPedidos';
// components
import LoadItem from '../../../components/LoadItem';

// services
import { GET_API } from '../../../services';

// interface
interface DashClienteInterface {
  filters: any;
}

const DashCliente = ({ filters }: DashClienteInterface) => {
  // router
  const navigate = useNavigate();

  // state
  const [CDF, setCDF] = useState<number>(-1);
  const [residuos, setResiduos] = useState<number | string>(-1);
  const [entrega, setEntrega] = useState<number>(-1);
  const [locadas, setLocadas] = useState<number>(-1);
  const [analise, setAnalise] = useState<number>(-1);
  const [transito, setTransito] = useState<number>(-1);

  // load cdf
  useEffect(() => {
    setCDF(-1);
    GET_API(
      `/dashboard/cdf?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setCDF(res.data));
  }, [filters]);
  // load residue
  useEffect(() => {
    setResiduos(-1);
    GET_API(
      `/dashboard/residue?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setResiduos(`${res.data || 0}m³`));
  }, [filters]);
  // load stationary
  useEffect(() => {
    setLocadas(-1);
    setEntrega(-1);
    setTransito(-1);
    setAnalise(-1);

    GET_API(
      `/dashboard/stationary?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => {
        setLocadas(res.data.locada);
        setEntrega(res.data.entrega);
        setTransito(res.data.transito);
        setAnalise(res.data.analise);
      });
  }, [filters]);

  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [typeDetail, setTypeDetail] = useState<string>('productbytype');

  const onOpenDetail = (status?: string, url = 'productbytype') => {
    setLoadingDetail(true);
    setOpenDetail(true);
    setTypeDetail(url);
    GET_API(
      `/dashboard/${url}?status=${status}&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setDataDetail(res.data))
      .finally(() => setLoadingDetail(false));
  };

  const onCloseDetail = () => {
    setLoadingDetail(true);
    setOpenDetail(false);
    setDataDetail([]);
  };

  return (
    <Row gutter={[16, 16]}>
      {/* <Col xl={4} lg={4} md={8} sm={12} xs={24}>
                <Button style={{height: 114, borderRadius: '0.6em'}} block type="primary">Solicitar caçamba</Button>
            </Col> */}
      <Col lg={4} md={8} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbArchive className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/documentos')}
          title="CDF emitidos"
          value={CDF}
        />
      </Col>
      <Col lg={4} md={8} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbTransformPointBottomLeft className="card-kpi-small-icon" />}
          onClick={() => onOpenDetail('', 'residuebytype')}
          title="Resíduos tratados"
          value={residuos}
        />
      </Col>
      <Col lg={4} md={8} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbShoppingCartPin className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/ordensdelocacao&locada')}
          title="Locadas"
          value={locadas}
        />
      </Col>
      <Col lg={4} md={8} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbShoppingCartPause className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/ordensdelocacao&entregapendente')}
          title="Entregas Pendentes"
          value={entrega}
        />
      </Col>
      <Col lg={4} md={8} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbTruckDelivery className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/ordensdelocacao&emtransito')}
          title="Em Trânsito"
          value={transito}
        />
      </Col>
      <Col lg={4} md={8} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbReport className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/ordensdelocacao&emanalise')}
          title="Em Análise"
          value={analise}
        />
      </Col>
      <Col md={14} xs={24}>
        <CardItem title="Ordens de locação por mês">
          <GraphCacambasPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col md={10} style={{ marginBottom: 60 }} xs={24}>
        <CardItem title="Últimos Pedidos">
          <GraphUltimosPedidos height="20em" />
        </CardItem>
      </Col>
      {/* MODAL DETALHES | CAÇAMBAS */}
      <Modal
        destroyOnClose
        footer={false}
        onCancel={onCloseDetail}
        open={openDetail}
        style={{ top: 25 }}
        title={
          typeDetail === 'productbytype'
            ? 'Caçambas por modelo'
            : 'Resíduos por classificação'
        }
      >
        <Row gutter={[8, 8]}>
          {loadingDetail ? (
            <Col span={24}>
              <LoadItem title="Carregando" type="alt" />
            </Col>
          ) : (
            <Col span={24}>
              <List
                dataSource={dataDetail}
                locale={{ emptyText: 'Nenhum dado encontrado' }}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <Row
                      align={'middle'}
                      justify={'space-between'}
                      style={{ width: '100%' }}
                    >
                      <Col>
                        <Typography className="dsh-item-link">
                          {typeDetail === 'productbytype'
                            ? `Modelo ${item.name}`
                            : item.name}
                        </Typography>
                      </Col>
                      <Col>
                        <Tag color="var(--color04)">
                          {typeDetail === 'productbytype'
                            ? item.total
                            : `${item.total || 0}m³`}
                        </Tag>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </Col>
          )}
        </Row>
      </Modal>
      <FloatButton
        className="fabbutton"
        description="Solicitar locação"
        icon={<TbShoppingCartPlus />}
        onClick={() => navigate('/painel/pedirlocacao')}
        style={{ bottom: 10, right: 60 }}
      />
    </Row>
  );
};

export default DashCliente;
