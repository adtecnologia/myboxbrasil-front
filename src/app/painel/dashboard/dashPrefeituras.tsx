// react libraries
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */

import { Col, List, Modal, Row, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
// icons
import { IoCartOutline, IoPeopleOutline } from 'react-icons/io5';
import { TbShoppingCartPin } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';
// components
import CardItem from '../../../components/CardItem';
import CardKPISmall from '../../../components/CardKPISmall';
import GraphCacambasPorMes from '../../../components/Graphics/graphCacambasPorMes';
import GraphMapaCacambasLocadas from '../../../components/Graphics/graphMapaCacambasLocadas';
import GraphUsuariosPorMes from '../../../components/Graphics/graphUsuariosPorMes';
import LoadItem from '../../../components/LoadItem';
// services
import { GET_API } from '../../../services';

// interface
interface DashPrefeiturasInterface {
  filters: any;
}

const DashPrefeituras = ({ filters }: DashPrefeiturasInterface) => {
  // route
  const navigate = useNavigate();

  // states
  const [locadores, setLocadores] = useState<number>(-1);
  const [locadoresApprove, setLocadoresApprove] = useState<number>(0);
  const [locatarios, setLocatarios] = useState<number>(-1);
  const [destinoFinal, setDestinoFinal] = useState<number>(-1);
  const [destinoFinalApprove, setDestinoFinalApprove] = useState<number>(0);
  const [locadas, setLocadas] = useState<number>(-1);
  const [fiscais, setFiscais] = useState<number>(-1);
  const [cacambas, setCacambas] = useState<number>(-1);
  const [openCacambas, setOpenCacambas] = useState<boolean>(false);
  const [openCacambasData, setOpenCacambasData] = useState<any[]>([]);
  const [openCacambasLoading, setOpenCacambasLoading] = useState<boolean>(true);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [approvalWait, setApprovalWait] = useState<boolean>(false);

  // carrega fiscais
  useEffect(() => {
    setFiscais(-1);
    GET_API(`/tax?ref=${filters.filterAno.value}-${filters.filterMes.value}`)
      .then((rs) => rs.json())
      .then((res) => setFiscais(res.meta.total));
  }, [filters]);
  // carrega locadores
  useEffect(() => {
    setLocadores(-1);
    GET_API(
      `/user?provider=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLocadores(res.meta.total));
    GET_API(
      `/user?provider=1&municipalApprovalStatus=waiting&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLocadoresApprove(res.meta.total));
  }, [filters]);
  // carrega locatarios
  useEffect(() => {
    setLocatarios(-1);
    GET_API(
      `/user?client=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLocatarios(res.meta.total));
  }, [filters]);
  // carrega destino final
  useEffect(() => {
    setLocatarios(-1);
    GET_API(
      `/user?finalDestination=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setDestinoFinal(res.meta.total));
    GET_API(
      `/user?finalDestination=1&municipalApprovalStatus=waiting&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setDestinoFinalApprove(res.meta.total));
  }, [filters]);
  // carrega caçambas
  useEffect(() => {
    setCacambas(-1);
    GET_API(
      `/stationary_bucket?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setCacambas(res.meta.total));
  }, [filters]);
  // carrega locadas
  useEffect(() => {
    setLocadas(-1);
    GET_API(
      `/dashboard/stationary?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLocadas(res.data.locada));
  }, [filters]);

  // verifica open caçamba
  useEffect(() => {
    setOpenCacambasLoading(true);
    if (openCacambas)
      GET_API(
        `/dashboard/productbytype?ref=${filters.filterAno.value}-${filters.filterMes.value}`
      )
        .then((rs) => rs.json())
        .then((res) => setOpenCacambasData(res.data))
        .finally(() => setOpenCacambasLoading(false));
  }, [openCacambas]);

  const onCloseDetail = () => {
    setLoadingDetail(true);
    setOpenDetail(false);
    setDataDetail([]);
  };

  useEffect(() => {
    GET_API('/me')
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setApprovalWait(res.data.address.city.municipal_approval);
      });
  }, []);

  return (
    <Row gutter={[16, 16]}>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoCartOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/produtos&cacambas&cadastros')}
          title="Caçambas"
          value={cacambas}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<TbShoppingCartPin className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/ordensdelocacao&locada')}
          title="Caçambas locadas"
          value={locadas}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&fiscais')}
          title="Fiscais"
          value={fiscais}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          alert={true}
          alertOnClick={() => navigate('/painel/usuarios&locadores')}
          alertText="Há registros aguardando aprovação"
          alertValue={locadoresApprove}
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&locadores')}
          title="Locadores"
          value={locadores}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          title="Locatários"
          value={locatarios}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          alert={true}
          alertOnClick={() => navigate('/painel/usuarios&destinofinal')}
          alertText="Há registros aguardando aprovação"
          alertValue={destinoFinalApprove}
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&destinofinal')}
          title="Destino final"
          value={destinoFinal}
        />
      </Col>
      
      <Col span={24}>
        <CardItem title={''}>
          <GraphMapaCacambasLocadas height="20em" />
        </CardItem>
      </Col>
      <Col lg={12} md={24} sm={24} xl={12} xs={24}>
        <CardItem title={`Novas caçambas por mês / ${filters.filterAno.label}`}>
          <GraphCacambasPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col lg={12} md={24} sm={24} xl={12} xs={24}>
        <CardItem title={`Novos usuários por mês / ${filters.filterAno.label}`}>
          <GraphUsuariosPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>

      {/* MODAL DETALHES | CAÇAMBAS */}
      <Modal
        destroyOnClose
        footer={false}
        onCancel={onCloseDetail}
        open={openDetail}
        style={{ top: 25 }}
        title="Caçambas por modelo"
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
                          Modelo {item.name}
                        </Typography>
                      </Col>
                      <Col>
                        <Tag color="var(--color04)">{item.total}</Tag>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </Col>
          )}
        </Row>
      </Modal>
    </Row>
  );
};

export default DashPrefeituras;
