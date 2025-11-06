// react libraries

import { Button, Col, Input, Modal, Result, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardCacamba from '../../../components/CardCacamba';
// components
import CardItem from '../../../components/CardItem';
import CardLocador from '../../../components/CardLocador';
import CardModel from '../../../components/CardModel';
import DrawerEndereco from '../../../components/DrawerEndereco';
import LoadItem from '../../../components/LoadItem';
import ModalFiltros from '../../../components/ModalFiltros';
import PageDefault from '../../../components/PageDefault';

// css
import './style.css';

import { FaBoxesPacking } from 'react-icons/fa6';
import { FiBox, FiHome, FiMapPin, FiTruck } from 'react-icons/fi';
// icons
import { IoFilter, IoSearch } from 'react-icons/io5';
import { LiaDumpsterSolid } from 'react-icons/lia';
import CardType from '@/components/CardType';
// services
import { GET_API, POST_API, verifyConfig } from '../../../services';

const PlaceOrder = () => {
  // router
  const navigate = useNavigate();

  // ESTADOS DO COMPONENTE
  const [step, setStep] = useState<number>(1);

  // RESPONSÁVEL PELO ENDEREÇO DE REFERÊNCIA
  const [open, setOpen] = useState<boolean>(false);
  const [load, setLoad] = useState<boolean>(true);

  const [address, setAddress] = useState<any>(null);
  const [typeSelect, setTypeSelect] = useState<any>(null);
  const [typeProdSelect, setTypeProdSelect] = useState<any>(null);
  const [modelSelect, setModelSelect] = useState<any>(null);
  const [providerSelect, setProviderSelect] = useState<any>(null);

  // ABRIR FILTRO
  const [modal, setModal] = useState<boolean>(false);

  // LISTA MODELOS CAÇAMBA
  const [model, setModel] = useState<any[]>([]);

  // LOCADORES
  const [findLocadores, setFindLocadores] = useState<boolean>(true);
  const [locadores, setLocadores] = useState<any[]>([]);
  const [locadoresLoading, setLocadoresLoading] = useState<boolean>(false);
  const [locadoresVerMais, setLocadoresVerMais] = useState<boolean>(true);
  const [locadoresPage, setLocadoresPage] = useState<number>(1);

  // CAÇAMBAS
  const [cacambas, setCacambas] = useState<any[]>([]);
  const [cacambasFilter, setCacambasFilter] = useState<any>(null);
  const [cacambasLoading, setCacambasLoading] = useState<boolean>(false);
  const [cacambasVerMais, setCacambasVerMais] = useState<boolean>(true);
  const [cacambasPage, setCacambasPage] = useState<number>(1);

  // CARREGA ENDEREÇO ATIVO
  const loadAddress = () => {
    GET_API('/address?active=1')
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length === 0) {
        } else setAddress(res.data[0]);
      });
  };

  // CARREGA MODELOS
  const loadModel = () => {
    GET_API('/stationary_bucket_type')
      .then((rs) => rs.json())
      .then((res) => {
        setModel(res.data);
      });
  };

  const onSetAddress = (value: any) => {
    POST_API('/address', { active: 1 }, value?.id).then((rs) => {
      if (rs.ok) {
        setAddress(value);
        setOpen(false);
      } else
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
    });
  };

  // CARREGA LOCADORES INICIO
  const onFindLocadores = () => {
    setFindLocadores(true);
    GET_API('/provider?page=1&per_page=6')
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setLocadores(res.data);
        setLocadoresPage(2);
        setLocadoresVerMais(!(Number(res.meta.total) === res.data.length));
      })
      .finally(() => setFindLocadores(false));
  };

  // CARREGA LOCADORES
  const loadLocadores = () => {
    setLocadoresLoading(true);
    GET_API(`/provider?page=${locadoresPage}&per_page=6`)
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setLocadores([...locadores, ...res.data]);
        setLocadoresPage(locadoresPage + 1);
        setLocadoresVerMais(
          !(Number(res.meta.total) === [...locadores, ...res.data].length)
        );
      })
      .finally(() => setLocadoresLoading(false));
  };

  // CARREGA CACAMBAS INICIO
  const onFindCacambas = () => {
    setCacambasLoading(true);
    GET_API(
      `/stationary_bucket_group?page=1&per_page=8${paramsFilter(cacambasFilter)}`
    )
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setCacambas(res.data);
        setCacambasPage(2);
        setCacambasVerMais(!(Number(res.meta.total) === res.data.length));
      })
      .finally(() => setCacambasLoading(false));
  };

  // CARREGA CACAMBAS
  const loadCacambas = () => {
    setCacambasLoading(true);
    GET_API(
      `/stationary_bucket_group?page=${cacambasPage}&per_page=8${paramsFilter(cacambasFilter)}`
    )
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setCacambas([...cacambas, ...res.data]);
        setCacambasPage(cacambasPage + 1);
        setCacambasVerMais(
          !(Number(res.meta.total) === [...cacambas, ...res.data].length)
        );
      })
      .finally(() => setCacambasLoading(false));
  };

  const paramsFilter = (values: any) => {
    var sort = '';
    switch (values?.sorter) {
      case 'PE':
        if (typeSelect === 'E') sort = 'price_external';
        if (typeSelect === 'I') sort = 'price_internal';
        break;
      case 'PI':
        if (typeSelect === 'E') sort = '-price_external';
        if (typeSelect === 'I') sort = '-price_internal';
        break;
      case 'A':
        sort = 'stationary_bucket_groups.created_at';
        break;
      case 'D':
        sort = 'distance';
        break;
      default:
        sort = 'stationary_bucket_groups.created_at';
        break;
    }
    return `
            &sort=${sort}&provider=${providerSelect?.id}&type=${modelSelect?.id}&type_local=${typeSelect}
            ${values?.type_lid ? `&type_lid=${values?.type_lid}` : ''}
            ${values?.residue ? `&residue=${values?.residue}` : ''}
            ${values?.priceE ? (typeSelect === 'E' ? `&priceExternal=${values?.priceE}` : `&priceInternal=${values?.priceE}`) : ''}
        `;
  };

  // MODAL FILTRO
  const onModal = () => setModal(!modal);

  useEffect(() => {
    loadAddress();
    setLoad(false);
  }, []);

  useEffect(() => {
    if (step === 4) loadModel();
    if (step === 5) onFindLocadores();
    if (step === 6) onFindCacambas();
  }, [step, cacambasFilter]);

  // useEffect(() => {
  // if (address) onFindLocadores()
  // if (address)
  // if (address) loadCacambas();
  // }, [address]);

  return (
    <PageDefault
      items={[{ title: 'Pedir Locação' }]}
      valid={verifyConfig(['pdd.add'])}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <Row gutter={[16, 16]}>
              {step >= 1 ? (
                <Col className="animation-fade" span={24}>
                  <CardItem
                    title={
                      <span
                        className="title-card"
                        style={{
                          justifyContent: step === 1 ? 'center' : 'flex-start',
                        }}
                      >
                        <FiMapPin style={{ marginRight: 8, minWidth: 14 }} />{' '}
                        {step === 1
                          ? 'Qual o endereço para locação?'
                          : `${address?.street}, ${address?.number} - ${address?.district} - ${address?.city.name} / ${address?.city.state.acronym}`}{' '}
                      </span>
                    }
                  >
                    {step === 1 ? (
                      <>
                        {address === null ? (
                          <Typography style={{ textAlign: 'center' }}>
                            Nenhum endereço selecionado
                          </Typography>
                        ) : (
                          <Typography style={{ textAlign: 'center' }}>
                            {address?.street}, {address?.number} -{' '}
                            {address?.district} - {address?.city.name} /{' '}
                            {address?.city.state.acronym}
                          </Typography>
                        )}
                        <Row
                          gutter={8}
                          justify={'center'}
                          style={{ marginTop: 18 }}
                        >
                          <Col>
                            <Button
                              onClick={() => setOpen(true)}
                              type="default"
                            >
                              Selecionar endereço
                            </Button>
                          </Col>
                          <Col>
                            <Button
                              disabled={!address}
                              onClick={() => setStep(2)}
                              type="primary"
                            >
                              Continuar
                            </Button>
                          </Col>
                        </Row>
                      </>
                    ) : null}
                  </CardItem>
                </Col>
              ) : null}
              {step >= 2 ? (
                <Col className="animation-fade" span={24}>
                  <CardItem
                    title={
                      <span
                        className="title-card"
                        style={{
                          justifyContent: step === 2 ? 'center' : 'flex-start',
                        }}
                      >
                        <LiaDumpsterSolid
                          size={24}
                          style={{ marginRight: 8, minWidth: 14 }}
                        />{' '}
                        {step === 2
                          ? 'Qual tipo de equipamento você deseja locar?'
                          : 'Caçamba'}{' '}
                      </span>
                    }
                  >
                    {step === 2 ? (
                      <>
                        <Row
                          align={'middle'}
                          gutter={[16, 16]}
                          justify={'center'}
                        >
                          <Col lg={4} md={6} sm={6} xl={4} xs={12}>
                            <CardType
                              item={{
                                disabled: true,
                                id: 'andaime',
                                name: 'Andaime',
                                photo: `${import.meta.env.VITE_URL_ASSETS}/produtos/andaime.jpg`,
                              }}
                              setTypeProdSelect={setTypeProdSelect}
                              typeProdSelect={typeProdSelect}
                            />
                          </Col>
                          <Col lg={4} md={6} sm={6} xl={4} xs={12}>
                            <CardType
                              item={{
                                disabled: true,
                                id: 'betoneira',
                                name: 'Betoneira',
                                photo: `${import.meta.env.VITE_URL_ASSETS}/produtos/betoneira.jpg`,
                              }}
                              setTypeProdSelect={setTypeProdSelect}
                              typeProdSelect={typeProdSelect}
                            />
                          </Col>
                          <Col lg={4} md={6} sm={6} xl={4} xs={12}>
                            <CardType
                              item={{
                                disabled: false,
                                id: 'cacamba',
                                name: 'Caçamba',
                                photo: `${import.meta.env.VITE_URL_ASSETS}/produtos/cacamba.jpg`,
                              }}
                              setTypeProdSelect={setTypeProdSelect}
                              typeProdSelect={typeProdSelect}
                            />
                          </Col>
                          <Col lg={4} md={6} sm={6} xl={4} xs={12}>
                            <CardType
                              item={{
                                disabled: true,
                                id: 'empilhadeira',
                                name: 'Empilhadeira',
                                photo: `${import.meta.env.VITE_URL_ASSETS}/produtos/empilhadeira.jpg`,
                              }}
                              setTypeProdSelect={setTypeProdSelect}
                              typeProdSelect={typeProdSelect}
                            />
                          </Col>
                        </Row>
                        <Row
                          gutter={8}
                          justify={'center'}
                          style={{ marginTop: 18 }}
                        >
                          <Col>
                            <Button onClick={() => setStep(1)} type="default">
                              Voltar
                            </Button>
                          </Col>
                          <Col>
                            <Button
                              disabled={!typeProdSelect}
                              onClick={() => setStep(3)}
                              type="primary"
                            >
                              Continuar
                            </Button>
                          </Col>
                        </Row>
                      </>
                    ) : null}
                  </CardItem>
                </Col>
              ) : null}
              {step >= 3 ? (
                <Col className="animation-fade" span={24}>
                  <CardItem
                    title={
                      <span
                        className="title-card"
                        style={{
                          justifyContent: step === 3 ? 'center' : 'flex-start',
                        }}
                      >
                        <FiHome style={{ marginRight: 8, minWidth: 14 }} />{' '}
                        {step === 3
                          ? 'Onde a caçamba será locada?'
                          : typeSelect === 'E'
                            ? 'Área externa'
                            : 'Área interna'}{' '}
                      </span>
                    }
                  >
                    {step === 3 ? (
                      <>
                        <Row gutter={[16, 16]}>
                          <Col md={12} xs={24}>
                            <div
                              className={`pd-painel ${typeSelect === 'E' ? 'active' : ''}`}
                              onClick={() => setTypeSelect('E')}
                              style={{
                                backgroundImage: `url(${import.meta.env.VITE_URL_ASSETS}/externo.jpg)`,
                              }}
                            >
                              <div className="pd-painel-pele" />
                              <Typography className="pd-painel-texto">
                                Área
                                <br />
                                Externa
                              </Typography>
                            </div>
                          </Col>
                          <Col md={12} xs={24}>
                            <div
                              className={`pd-painel ${typeSelect === 'I' ? 'active' : ''}`}
                              onClick={() => setTypeSelect('I')}
                              style={{
                                backgroundImage: `url(${import.meta.env.VITE_URL_ASSETS}/interno.webp)`,
                              }}
                            >
                              <div className="pd-painel-pele" />
                              <Typography className="pd-painel-texto">
                                {' '}
                                Área <br /> Interna{' '}
                              </Typography>
                            </div>
                          </Col>
                        </Row>
                        <Row
                          gutter={8}
                          justify={'center'}
                          style={{ marginTop: 18 }}
                        >
                          <Col>
                            <Button onClick={() => setStep(2)} type="default">
                              Voltar
                            </Button>
                          </Col>
                          <Col>
                            <Button
                              disabled={!typeSelect}
                              onClick={() => setStep(4)}
                              type="primary"
                            >
                              Continuar
                            </Button>
                          </Col>
                        </Row>
                      </>
                    ) : null}
                  </CardItem>
                </Col>
              ) : null}
              {step >= 4 ? (
                <Col className="animation-fade" span={24}>
                  <CardItem
                    title={
                      <span
                        className="title-card"
                        style={{
                          justifyContent: step === 4 ? 'center' : 'flex-start',
                        }}
                      >
                        <FiBox style={{ marginRight: 8, minWidth: 14 }} />{' '}
                        {step === 4
                          ? 'Qual o modelo da caçamba que deseja?'
                          : `Modelo ${modelSelect?.name} - ${modelSelect?.m3}m³`}{' '}
                      </span>
                    }
                  >
                    {step === 4 ? (
                      <>
                        <Row gutter={[16, 16]} justify={'center'}>
                          {model.length > 0 ? (
                            model.map((v: any, i: any) => (
                              <Col key={i} md={8} xl={4} xs={12}>
                                <CardModel
                                  item={v}
                                  modelSelect={modelSelect}
                                  setModelSelect={setModelSelect}
                                />
                              </Col>
                            ))
                          ) : (
                            <Col span={24}>
                              <LoadItem title="Carregando modelos" type="alt" />
                            </Col>
                          )}
                        </Row>
                        <Row
                          gutter={8}
                          justify={'center'}
                          style={{ marginTop: 18 }}
                        >
                          <Col>
                            <Button onClick={() => setStep(3)} type="default">
                              Voltar
                            </Button>
                          </Col>
                          <Col>
                            <Button
                              disabled={!modelSelect}
                              onClick={() => setStep(5)}
                              type="primary"
                            >
                              Continuar
                            </Button>
                          </Col>
                        </Row>
                      </>
                    ) : null}
                  </CardItem>
                </Col>
              ) : null}
              {step >= 5 ? (
                <Col className="animation-fade" span={24}>
                  <CardItem
                    title={
                      <span
                        className="title-card"
                        style={{
                          justifyContent: step === 5 ? 'center' : 'flex-start',
                        }}
                      >
                        <FiTruck style={{ marginRight: 8, minWidth: 14 }} />{' '}
                        {step === 5
                          ? 'De qual locador quer alugar?'
                          : `${providerSelect?.name}`}{' '}
                      </span>
                    }
                  >
                    {step === 5 ? (
                      <>
                        <Row gutter={[16, 16]} justify={'start'}>
                          {locadores.length > 0 ? (
                            locadores.map((v: any, i: any) => (
                              <Col key={i} md={8} xs={24}>
                                <CardLocador
                                  item={v}
                                  providerSelect={providerSelect}
                                  setProviderSelect={setProviderSelect}
                                />
                              </Col>
                            ))
                          ) : (
                            <Col span={24}>
                              <LoadItem
                                title="Carregando locadores"
                                type="alt"
                              />
                            </Col>
                          )}
                          {locadoresVerMais ? (
                            <Col span={24}>
                              <Button
                                block
                                loading={locadoresLoading}
                                onClick={loadLocadores}
                                type="link"
                              >
                                Ver mais
                              </Button>
                            </Col>
                          ) : null}
                        </Row>
                        <Row
                          gutter={8}
                          justify={'center'}
                          style={{ marginTop: 18 }}
                        >
                          <Col>
                            <Button onClick={() => setStep(4)} type="default">
                              Voltar
                            </Button>
                          </Col>
                          <Col>
                            <Button
                              disabled={!providerSelect}
                              onClick={() => setStep(6)}
                              type="primary"
                            >
                              Buscar caçambas
                            </Button>
                          </Col>
                        </Row>
                      </>
                    ) : null}
                  </CardItem>
                </Col>
              ) : null}
              {step >= 6 ? (
                <Col className="animation-fade" span={24}>
                  <CardItem
                    title={
                      <span className="title-card">
                        <FiTruck style={{ marginRight: 8, minWidth: 14 }} />
                        Agora, escolha uma caçamba!
                      </span>
                    }
                  >
                    <Button
                      className="pd-button-card"
                      icon={<IoFilter />}
                      onClick={onModal}
                      type="link"
                    >
                      Filtros
                    </Button>
                    <Row gutter={[16, 16]} justify={'start'}>
                      {cacambasLoading ? (
                        <Col span={24}>
                          <LoadItem title="Carregando cacambas" type="alt" />
                        </Col>
                      ) : cacambas.length > 0 ? (
                        cacambas.map((v: any, i: any) => (
                          <Col key={i} md={12} xs={24}>
                            <CardCacamba
                              item={v}
                              type="shop"
                              typeLocal={typeSelect}
                            />
                          </Col>
                        ))
                      ) : (
                        <Col span={24}>
                          <Typography style={{ textAlign: 'center' }}>
                            Não encontramos nenhuma caçamba
                          </Typography>
                        </Col>
                      )}
                      {cacambasVerMais ? (
                        <Col span={24}>
                          <Button
                            block
                            loading={cacambasLoading}
                            onClick={loadCacambas}
                            type="link"
                          >
                            Ver mais
                          </Button>
                        </Col>
                      ) : null}
                    </Row>
                    <Row
                      gutter={8}
                      justify={'center'}
                      style={{ marginTop: 18 }}
                    >
                      <Col>
                        <Button onClick={() => setStep(5)} type="default">
                          Voltar
                        </Button>
                      </Col>
                    </Row>
                  </CardItem>
                </Col>
              ) : null}
            </Row>
          )}
        </Col>
        <ModalFiltros action={setCacambasFilter} close={onModal} open={modal} />
      </Row>
      <DrawerEndereco
        address={address}
        close={() => setOpen(false)}
        disabledClose={address === null}
        open={open}
        setAddress={onSetAddress}
      />
    </PageDefault>
  );
};

export default PlaceOrder;
