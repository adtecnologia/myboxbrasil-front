// react libraries

import { Col, List, Modal, Row, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
// icons
import {
  IoBusinessOutline,
  IoCardOutline,
  IoCartOutline,
  IoPeopleOutline,
} from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';

// components
import CardItem from '../../../components/CardItem';
import CardKPISmall from '../../../components/CardKPISmall';
import GraphCacambasPorMes from '../../../components/Graphics/graphCacambasPorMes';
import GraphMunicipiosComMaisPedidos from '../../../components/Graphics/graphMunicipiosComMaisPedidos';
import GraphPedidos from '../../../components/Graphics/graphPedidos';
import GraphUsuariosPorMes from '../../../components/Graphics/graphUsuariosPorMes';
import LoadItem from '../../../components/LoadItem';

// services
import { GET_API } from '../../../services';

// interface
interface DashAdminInterface {
  filters: any;
}

const DashAdmin = ({ filters }: DashAdminInterface) => {
  // route
  const navigate = useNavigate();

  // states
  const [locadores, setLocadores] = useState<number>(-1);
  const [locatarios, setLocatarios] = useState<number>(-1);
  const [destinoFinal, setDestinoFinal] = useState<number>(-1);
  const [prefeituras, setPrefeituras] = useState<number>(-1);
  const [cacambas, setCacambas] = useState<number>(-1);
  const [pedidos, setPedidos] = useState<number>(-1);
  const [openCacambas, setOpenCacambas] = useState<boolean>(false);
  const [openCacambasData, setOpenCacambasData] = useState<any[]>([]);
  const [openCacambasLoading, setOpenCacambasLoading] = useState<boolean>(true);

  // carrega prefeituras
  useEffect(() => {
    setPrefeituras(-1);
    GET_API(
      `/user?cityhall=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setPrefeituras(res.meta.total));
  }, [filters]);
  // carrega locadores
  useEffect(() => {
    setLocadores(-1);
    GET_API(
      `/user?provider=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLocadores(res.meta.total));
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
  // carrega pedidos
  useEffect(() => {
    setPedidos(-1);
    GET_API(
      `/order_location?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setPedidos(res.meta.total));
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

  return (
    <Row gutter={[16, 16]}>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&locadores')}
          title="Locadores"
          value={locadores}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&locatarios')}
          title="Locatários"
          value={locatarios}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoPeopleOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&destinofinal')}
          title="Destino final"
          value={destinoFinal}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoBusinessOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/usuarios&prefeituras')}
          title="Prefeituras"
          value={prefeituras}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoCartOutline className="card-kpi-small-icon" />}
          onClick={() => setOpenCacambas(true)}
          title="Caçambas"
          value={cacambas}
        />
      </Col>
      <Col lg={4} md={12} sm={12} xl={4} xs={24}>
        <CardKPISmall
          icon={<IoCardOutline className="card-kpi-small-icon" />}
          onClick={() => navigate('/painel/pedidos')}
          title="Ordens de locação realizadas"
          value={pedidos}
        />
      </Col>
      <Col lg={16} md={24} sm={24} xl={16} xs={24}>
        <CardItem
          title={`Ordens de locação realizadas por mês / ${filters.filterAno.label}`}
        >
          <GraphPedidos filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col lg={8} md={10} sm={24} xl={8} xs={24}>
        <CardItem title="Municípios com mais pedidos">
          <GraphMunicipiosComMaisPedidos filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col lg={12} md={14} sm={24} xl={12} xs={24}>
        <CardItem title={`Novas caçambas por mês / ${filters.filterAno.label}`}>
          <GraphCacambasPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col lg={12} md={24} sm={24} xl={12} xs={24}>
        <CardItem title={`Novos usuários por mês / ${filters.filterAno.label}`}>
          <GraphUsuariosPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>

      {/* modal detalhes | caçambas */}
      <Modal
        destroyOnClose
        footer={false}
        onCancel={() => setOpenCacambas(false)}
        open={openCacambas}
        style={{ top: 25 }}
        title="Caçambas por modelo"
      >
        <Row gutter={[8, 8]}>
          {openCacambasLoading ? (
            <Col span={24}>
              <LoadItem title="Carregando" type="alt" />
            </Col>
          ) : (
            <Col span={24}>
              <List
                dataSource={openCacambasData}
                locale={{ emptyText: 'Nenhum dado encontrado' }}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <Row
                      align={'middle'}
                      justify={'space-between'}
                      style={{ width: '100%' }}
                    >
                      <Col>
                        <Link
                          to={`/painel/dadossistema&modelosdecacamba/${item.id}/cacambas`}
                        >
                          <Typography className="dsh-item-link">
                            Modelo {item.name}
                          </Typography>
                        </Link>
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

export default DashAdmin;
