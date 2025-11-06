/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Col,
  Divider,
  Dropdown,
  Image,
  Menu,
  type MenuProps,
  Modal,
  message,
  notification,
  Row,
  Space,
  Typography,
} from 'antd';
import detectUrlChange from 'detect-url-change';
import React, { useEffect, useMemo, useState } from 'react';
import { GoDatabase, GoLock } from 'react-icons/go';
import {
  IoBagHandleOutline,
  IoCartOutline,
  IoCashOutline,
  IoConstructOutline,
  IoDocumentAttachOutline,
  IoGridOutline,
  IoHeadsetOutline,
  IoIdCardOutline,
  IoLogOutOutline,
  IoMenu,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { LiaDumpsterSolid } from 'react-icons/lia';
import { PiTruck } from 'react-icons/pi';
import { RiNotification2Line } from 'react-icons/ri';
import {
  TbCalendarCheck,
  TbCalendarEvent,
  TbReportAnalytics,
  TbRoute,
} from 'react-icons/tb';
import { Link, Outlet, useNavigate } from 'react-router-dom';
// styles
import './styles.css';
// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/4.png`;

import { LuTriangleAlert } from 'react-icons/lu';
import PdfViewerComponent from '@/components/PdfComponent';
// services
import {
  delConfig,
  delToken,
  GET_API,
  getProfileName,
  getProfileOwner,
  getProfileType,
  getToken,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from '../../services';

const Panel = () => {
  // router
  const navigate = useNavigate();

  // context
  const Context = React.createContext({ name: 'Default' });
  const contextValue = useMemo(() => ({ name: 'I9 Coleta' }), []);

  // notification
  const [api, contextHolder] = notification.useNotification();

  // states
  const [url, setUrl] = useState<string>(window.location.href.split('/')[4]);
  const [menuMain, setMenuMain] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [notf, setNotf] = useState<number>(0);

  const [sendTerm, setSendTerm] = useState<boolean>(false);
  const [modalTermos, setModalTermos] = useState<boolean>(false);
  const [modalPolitica, setModalPolitica] = useState<boolean>(false);
  const [termoData, setTermoData] = useState<any>();
  const [politicaData, setPoliticaData] = useState<any>();

  const [dropNotf, setDropNotf] = useState<MenuProps['items']>([
    {
      key: '*',
      label: (
        <Typography className="painel-drop-title">Notificações</Typography>
      ),
      disabled: true,
    },
  ]);

  // type menu
  type MenuItemProps = Required<MenuProps>['items'][number];
  // menu array
  const items: MenuItemProps[] = [
    { key: 'dashboard', label: 'Painel', icon: <IoGridOutline /> },
    {
      key: 'financeiro',
      label: 'Financeiro',
      icon: <IoCashOutline />,
      disabled: !(
        getProfileType() === 'SELLER' ||
        getProfileType() === 'LEGAL_SELLER' ||
        getProfileType() === 'SELLER_EMPLOYEE' ||
        getProfileType() === 'ADMIN' ||
        getProfileType() === 'ADMIN_EMPLOYEE'
      ),
      children: [
        { key: 'financeiro&minhaconta', label: 'Minha conta', disabled: false },
        {
          key: 'financeiro&resumo',
          label:
            getProfileType() === 'ADMIN' ||
            getProfileType() === 'ADMIN_EMPLOYEE'
              ? 'Resumo plataforma'
              : 'Resumo',
          disabled: false,
        },
        { key: 'financeiro&transacoes', label: 'Transações', disabled: false },
        { key: 'financeiro&extrato', label: 'Extrato', disabled: false },
      ],
    },
    {
      key: 'pedirlocacao',
      label: 'Solicitar locação',
      icon: <LiaDumpsterSolid size={26} />,
      disabled: !verifyConfig(['pdd.add']),
    },
    {
      key: 'pedidos',
      label: 'Pedidos',
      icon: <IoNewspaperOutline />,
      disabled: !verifyConfig(['pdd.list']),
    },
    {
      key: 'entregasagendadas',
      label: 'Entregas Agendadas',
      icon: <TbCalendarEvent />,
      disabled: !verifyConfig(['fmt.vep']),
    },
    {
      key: 'retiradasagendadas',
      label: 'Retiradas Agendadas',
      icon: <TbCalendarCheck />,
      disabled: !verifyConfig(['fmt.vrp']),
    },
    {
      key: 'ordensdelocacao',
      label: 'Ordens de Locação',
      icon: <IoBagHandleOutline />,
      disabled: !verifyConfig([
        'ord.agr.list',
        'ord.lcd.list',
        'ord.prc.list',
        'ord.anl.list',
        'ord.agr.cdf.list',
        'ord.cdf.list',
      ]),
      children: [
        {
          key: 'ordensdelocacao&entregapendente',
          label: 'Entrega pendente',
          disabled: !verifyConfig(['ord.agr.list']),
        },
        {
          key: 'ordensdelocacao&emtransito',
          label: 'Em trânsito',
          disabled: !verifyConfig(['ord.ent.list']),
        },
        {
          key: 'ordensdelocacao&locada',
          label: 'Locado',
          disabled: !verifyConfig(['ord.lcd.list']),
        },
        {
          key: 'ordensdelocacao&emanalise',
          label: 'Em análise',
          disabled: !verifyConfig(['ord.anl.list']),
        },
        {
          key: 'ordensdelocacao&cdfemitido',
          label: 'CDF emitido',
          disabled: !verifyConfig(['ord.cdf.list']),
        },
      ],
    },
    {
      key: 'documentos',
      label: 'Documentos',
      icon: <IoDocumentAttachOutline />,
      disabled: !verifyConfig(['mtr.list']),
    },
    {
      key: 'ocorrencias',
      label: 'Ocorrências',
      icon: <LuTriangleAlert />,
      disabled: !verifyConfig(['ocr.list']),
    },
    {
      key: 'produtos',
      label: 'Produtos',
      icon: <IoConstructOutline />,
      disabled: !verifyConfig(['cmb.list']),
      children: [
        {
          key: 'produtos&andaimes&cadastros',
          label: 'Andaimes',
          disabled: !verifyConfig(['and.list']),
        },
        {
          key: 'produtos&betoneiras&cadastros',
          label: 'Betoneiras',
          disabled: !verifyConfig(['btn.list']),
        },
        {
          key: 'produtos&cacambas&cadastros',
          label: 'Caçambas',
          disabled: !verifyConfig(['cmb.list']),
        },
        {
          key: 'produtos&empilhadeiras&cadastros',
          label: 'Empilhadeiras',
          disabled: !verifyConfig(['emp.list']),
        },
      ],
    },
    {
      key: 'veiculos',
      label: 'Veículos',
      icon: <PiTruck />,
      disabled: !verifyConfig(['vcl.list']),
    },
    {
      key: 'usuarios',
      label: 'Usuários',
      icon: <IoPeopleOutline />,
      disabled: !verifyConfig([
        'lct.list',
        'lcd.list',
        'dtf.list',
        'eqp.list',
        'mot.list',
      ]),
      children: [
        {
          key: 'usuarios&destinofinal',
          label: 'Destino Final',
          disabled: !verifyConfig(['dtf.list']),
        },
        {
          key: 'usuarios&equipe',
          label: 'Equipe',
          disabled: !verifyConfig(['eqp.list']),
        },
        {
          key: 'usuarios&locatarios',
          label: 'Locatários',
          disabled: !verifyConfig(['lct.list']),
        },
        {
          key: 'usuarios&locadores',
          label: 'Locadores',
          disabled: !verifyConfig(['lcd.list']),
        },
        {
          key: 'usuarios&motoristas',
          label: 'Motorista',
          disabled: !verifyConfig(['mot.list']),
        },
        {
          key: 'usuarios&prefeituras',
          label: 'Prefeituras',
          disabled: !verifyConfig(['hal.list']),
        },
        {
          key: 'usuarios&fiscais',
          label: 'Fiscais',
          disabled: !verifyConfig(['tax.list']),
        },
      ],
    },
    {
      key: 'atendimento',
      label: 'Atendimento',
      icon: <IoHeadsetOutline />,
      disabled: !verifyConfig(['ctt.list', 'tkt.list']),
      children: [
        {
          key: 'atendimento&contatos',
          label: 'Mensagens do site',
          disabled: !verifyConfig(['ctt.list']),
        },
        {
          key: 'atendimento&chamados',
          label: 'Chamados',
          disabled: !verifyConfig(['tkt.list']),
        },
      ],
    },
    {
      key: 'rastreamento',
      label: 'Rastreamento',
      icon: <TbRoute />,
      disabled: !verifyConfig(['rou.list']),
    },
    {
      key: 'relatorios',
      label: 'Relatórios',
      icon: <TbReportAnalytics />,
      disabled: !verifyConfig([
        'rpt.vdp',
        'rpt.ddr',
        'rpt.cdr',
        'rpt.eml',
        'rpt.ieo',
        'rpt.ima',
        'rpt.lac',
        'rpt.cpb',
        'rpt.rkc',
        'rpt.pmt',
        'rpt.lpo',
        'rpt.gap',
        'rpt.ids',
        'rpt.rdr',
        'rpt.qlp',
        'rpt.cmb',
        'rpt.aor',
      ]),
      children: [
        {
          key: 'relatorios&locacoes',
          label: 'Locações',
          disabled: !verifyConfig(['rpt.lac']),
        },
        {
          key: 'relatorios&porbairro',
          label: 'Caçambas por Bairro',
          disabled: !verifyConfig(['rpt.cpb']),
        },
        {
          key: 'relatorios&porobra',
          label: 'Caçambas por Obra',
          disabled: !verifyConfig(['rpt.cpo']),
        },
        {
          key: 'relatorios&ranking',
          label: 'Ranking de clientes',
          disabled: !verifyConfig(['rpt.rkc']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Performance de Motoristas',
          disabled: !verifyConfig(['rpt.pmt']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Locação por Obra',
          disabled: !verifyConfig(['rpt.lpo']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Gastos Acumulados',
          disabled: !verifyConfig(['rpt.gap']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Índice de Satisfação',
          disabled: !verifyConfig(['rpt.ids']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Quilometragem Percorrida',
          disabled: !verifyConfig(['rpt.qlp']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Roteiros Diários Realizados',
          disabled: !verifyConfig(['rpt.rdr']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Registro de Caçambas',
          disabled: !verifyConfig(['rpt.cmb']),
        },
        {
          key: 'relatorios&contatos',
          label: 'Atrasos e Ocorrências Registradas',
          disabled: !verifyConfig(['rpt.aor']),
        },
        {
          key: 'relatorios&vencimentoprazo',
          label: 'Vencimento de Prazo',
          disabled: !verifyConfig(['rpt.vdp']),
        },
        {
          key: 'relatorios&destinacaoresiduos',
          label: 'Destinação de Resíduos',
          disabled: !verifyConfig(['rpt.ddr']),
        },
        {
          key: 'relatorios&classesderesiduos',
          label: 'Classes de Resíduos',
          disabled: !verifyConfig(['rpt.cdr']),
        },
        {
          key: 'relatorios&situacaolocadores',
          label: 'Situação Locadores',
          disabled: !verifyConfig(['rpt.eml']),
        },
      ],
    },
    {
      key: 'lgpd',
      label: 'LGPD',
      icon: <GoLock />,
      disabled: !verifyConfig(['acp.list', 'trm.list', 'plt.list']),
      children: [
        {
          key: 'lgpd&aceites',
          label: 'Aceites dos usuários',
          disabled: !verifyConfig(['acp.list']),
        },
        {
          key: 'lgpd&termosdeuso',
          label: 'Termos de uso',
          disabled: !verifyConfig(['trm.list']),
        },
        {
          key: 'lgpd&politicadeprivacidade',
          label: 'Política de privacidade',
          disabled: !verifyConfig(['plt.list']),
        },
      ],
    },
    {
      key: 'dadossistema',
      label: 'Dados Sistema',
      icon: <GoDatabase />,
      disabled: !verifyConfig([
        'tvc.list',
        'mcm.list',
        'rsd.list',
        'etd.list',
        'cdd.list',
      ]),
      children: [
        {
          key: 'dadossistema&tecnologiatratamento',
          label: 'Tecnologia de Tratamento',
          disabled: !verifyConfig(['tec.list']),
        },
        {
          key: 'dadossistema&tiposdeveiculos',
          label: 'Tipos de Veículos',
          disabled: !verifyConfig(['tvc.list']),
        },
        {
          key: 'dadossistema&modelosdecacamba',
          label: 'Modelos de Caçamba',
          disabled: !verifyConfig(['mcm.list']),
        },
        {
          key: 'dadossistema&residuos',
          label: 'Classes de Residuo',
          disabled: !verifyConfig(['rsd.list']),
        },
        {
          key: 'dadossistema&estados',
          label: 'Estados',
          disabled: !verifyConfig(['std.list']),
        },
        {
          key: 'dadossistema&cidades',
          label: 'Cidades',
          disabled: !verifyConfig(['cdd.list']),
        },
      ],
    },
  ];

  // carregar notificações
  const onLoadNotf = () => {
    GET_API('/notification?page=1&per_page=6&sort=-id&status=unread')
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        const temp = [
          {
            key: '*',
            label: (
              <Typography className="painel-drop-title">
                Notificações
              </Typography>
            ),
            disabled: true,
          },
        ];
        if (res.meta.total === 0) {
          temp.push({
            key: '-',
            label: <span>Nenhuma notificação</span>,
            disabled: true,
          });
        } else {
          res.data.map((item: any) => {
            temp.push({
              key: item.id,
              label: (
                <Link className="painel-drop-text" to={item.url}>
                  {item.message}
                </Link>
              ),
              disabled: false,
            });
            return null;
          });
        }
        setNotf(res.meta.total);
        setDropNotf(temp);
      });
  };

  // sair do sistema
  const onLogOut = () => {
    Modal.confirm({
      title: 'Sair do sistema?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        detectUrlChange.removeAllListeners();
        delConfig();
        delToken();
        navigate('/login');
      },
    });
  };

  // mudar estado menu
  const onMenuMain = () => setMenuMain(!menuMain);

  // função que roda assim que carregar o componente
  // biome-ignore lint/correctness/useExhaustiveDependencies: ignorar
  useEffect(() => {
    // verifica usuário logado
    GET_API('/me')
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setUser({
          id: res.data.id,
          name: res.data.name,
          photo: res.data.photo,
          profile: getProfileName(),
        });
      })
      .catch(POST_CATCH);

    // carregar notificações
    onLoadNotf();

    verifyLgpd();
    // função que observa a mudança na rota para atualizar menu ativo
    detectUrlChange.on('change', (newUrl) => {
      const params = String(newUrl).split('/');
      setUrl(params[4]);
      setMenuMain(false);
      if (getToken() == null) {
        navigate('/login');
      }
    });
    // verificar carrinho
    if (verifyConfig(['dsh.cln'])) {
      POST_API('/cart', {})
        .then((rs) => rs.json())
        .then(() => {
          // if (res.return) {
          // }
        })
        .catch(POST_CATCH);
    }
  }, []);

  const verifyLgpd = () => {
    GET_API('/lgpd_acceptance/verify')
      .then((rs) => rs.json())
      .then((res) => {
        if (!res.term_of_use_accepted) {
          onAceiteTermos();
          return;
        }
        if (!res.privacy_policy_accepted) {
          onAceitePolitica();
          return;
        }
      });
  };

  const onSend = (values: any) => {
    setSendTerm(true);
    POST_API('/lgpd_acceptance', {
      ...values,
      id: values.type === 'term_of_use' ? termoData.id : politicaData.id,
    })
      .then((rs) => rs.json())
      .then((res) => {
        message.success(res.message);
        verifyLgpd();
        setSendTerm(false);
        setModalPolitica(false);
        setModalTermos(false);
      });
  };

  const onAceiteTermos = () => {
    GET_API('/term_of_use/latest')
      .then((rs) => rs.json())
      .then((res) => {
        setModalTermos(true);
        setTermoData(res.data);
      });
  };

  const onAceitePolitica = () => {
    GET_API('/privacy_policy/latest')
      .then((rs) => rs.json())
      .then((res) => {
        setModalPolitica(true);
        setPoliticaData(res.data);
      });
  };

  // função que roda quando o valor do state user altera
  // biome-ignore lint/correctness/useExhaustiveDependencies: ignroar
  useEffect(() => {
    if (user) {
      // observa as notificações
      window.Echo.channel('notifications').listen(
        '.App\\Events\\Notification\\Created',
        (e: any) => {
          if (
            (getProfileType() === 'SELLER_DRIVER' &&
              user.id === e.notification.user_to_id) ||
            (getProfileType() !== 'SELLER_DRIVER' &&
              Number(getProfileOwner()) === e.notification.user_to_id)
          ) {
            // onLoadNotf()
            api.info({
              message: `Olá, ${user?.name}`,
              description: e.notification.message,
              placement: 'bottomRight',
              key: e.notification.id,
              duration: 8,
              btn: (
                <Space>
                  <Button
                    onClick={() => {
                      POST_API(
                        '/notification',
                        { status: 'read' },
                        e.notification.id
                      );
                    }}
                    type="default"
                  >
                    Marcar como lida
                  </Button>
                  <Button
                    onClick={() => navigate(e.notification.url)}
                    type="primary"
                  >
                    Abrir
                  </Button>
                </Space>
              ),
            });
          }
        }
      );
    }
  }, [user]);

  return (
    <Row className="painel">
      <Context.Provider value={contextValue}>
        {' '}
        {contextHolder}{' '}
      </Context.Provider>
      <div className="painel-logo">
        <Image className="painel-logo-img" preview={false} src={logo} />
      </div>
      <Col className="painel-head" span={24}>
        <Row
          align={'middle'}
          className="painel-head-row"
          justify={'space-between'}
        >
          <Col>
            <IoMenu className="painel-menu" onClick={onMenuMain} />
          </Col>
          <Col>
            <Row align={'middle'} gutter={[8, 8]}>
              <Col>
                <Dropdown arrow menu={{ items: dropNotf }}>
                  <Badge
                    className="painel-head-badge"
                    count={notf}
                    size="small"
                    style={{ zIndex: 10 }}
                  >
                    <Button className="painel-head-button">
                      <RiNotification2Line
                        onClick={() => navigate('notificacoes')}
                      />
                    </Button>
                  </Badge>
                </Dropdown>
              </Col>
              {getProfileType() === 'CUSTOMER' ||
              getProfileType() === 'LEGAL_CUSTOMER' ||
              getProfileType() === 'CUSTOMER_EMPLOYEE' ? (
                <Col>
                  <Link to="/painel/carrinho">
                    <Button className="painel-head-button">
                      <IoCartOutline />
                    </Button>
                  </Link>
                </Col>
              ) : null}
              <Col>
                <Dropdown
                  arrow
                  menu={{
                    items: [
                      {
                        key: 'perfil',
                        label: <Link to="/painel/meuperfil">Meu Perfil</Link>,
                        icon: (
                          <IoIdCardOutline color="var(--color01)" size={18} />
                        ),
                      },
                      {
                        key: 'configuracoes',
                        label: (
                          <Link to="/painel/configuracoes">Configurações</Link>
                        ),
                        icon: (
                          <IoSettingsOutline color="var(--color01)" size={18} />
                        ),
                        style: {
                          display:
                            getProfileType() === 'CITY' ||
                            getProfileType() === 'TAX'
                              ? 'none'
                              : 'block',
                        },
                      },
                      {
                        key: 'sair',
                        label: 'Sair',
                        icon: <IoLogOutOutline color="#FFF" size={18} />,
                        style: {
                          backgroundColor: 'var(--color04)',
                          color: '#FFF',
                        },
                        onClick: onLogOut,
                      },
                    ],
                  }}
                  trigger={['click', 'hover']}
                >
                  <Row className="painel-head-user" gutter={[4, 4]}>
                    <Col>
                      <Avatar
                        className="painel-head-avatar"
                        shape="square"
                        src={user?.photo}
                      />
                    </Col>
                    <Col className="painel-head-text">
                      <Typography className="painel-head-typeuser">
                        {user?.profile}
                      </Typography>
                      <Typography className="painel-head-nameuser">
                        {user?.name}
                      </Typography>
                    </Col>
                  </Row>
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col className="painel-body" span={24}>
        <Row style={{ flexWrap: 'nowrap' }}>
          <Col
            className={menuMain ? 'painel-sidebar active' : 'painel-sidebar'}
            flex={'auto'}
          >
            <div className={'painel-sidebar-content'}>
              <Row
                align={'middle'}
                style={{ flexDirection: 'column', padding: '0.6em 0.4em' }}
              >
                <Col>
                  <Avatar
                    className="painel-sidebar-avatar"
                    src={user?.photo}
                    style={{ transition: '0.2s' }}
                  />
                </Col>
                <Col className="painel-sidebar-col">
                  <Typography className="painel-sidebar-name">
                    {user?.name}
                  </Typography>
                </Col>
                <Col className="painel-sidebar-col">
                  <Row
                    align={'middle'}
                    gutter={[8, 8]}
                    style={{ marginTop: 8 }}
                  >
                    <Col>
                      <Badge count={notf} size="small" style={{ zIndex: 10 }}>
                        <Button
                          className="painel-sidebar-button"
                          onClick={() => navigate('notificacoes')}
                        >
                          <RiNotification2Line />
                        </Button>
                      </Badge>
                    </Col>
                    {getProfileType() === 'CUSTOMER' ||
                    getProfileType() === 'LEGAL_CUSTOMER' ||
                    getProfileType() === 'CUSTOMER_EMPLOYEE' ? (
                      <Col>
                        <Link to="/painel/carrinho">
                          <Button className="painel-sidebar-button">
                            <IoCartOutline />
                          </Button>
                        </Link>
                      </Col>
                    ) : null}
                  </Row>
                </Col>
              </Row>
              <Divider style={{ margin: '0px' }} />
              <Row
                className="painel-sidebar-scroll"
                style={{ marginTop: '0.4em' }}
              >
                {user !== null && (
                  <Col span={24}>
                    <Menu
                      className="my-menu"
                      defaultSelectedKeys={[url]}
                      inlineCollapsed={!menuMain}
                      items={items}
                      mode="inline"
                      onClick={(e) => navigate(e.key)}
                      selectedKeys={[url]}
                    />
                  </Col>
                )}
              </Row>
            </div>
          </Col>
          <Col className="painel-content" flex={'auto'}>
            <Outlet />
          </Col>
        </Row>
      </Col>
      <Modal
        className="no-footer"
        closable={false}
        destroyOnHidden
        footer={false}
        open={modalTermos && termoData}
        style={{ top: 10 }}
      >
        <Typography className="title-termo">Termos de uso</Typography>
        <PdfViewerComponent fileUrl={termoData?.document} />
        <Row gutter={[8, 8]} justify={'center'} style={{ marginTop: 10 }}>
          <Col>
            <Button
              onClick={() =>
                Modal.warning({
                  title: 'Atenção!',
                  content:
                    'Aceitar os termos de uso é obrigatório para utilizar nossos serviços. Sem essa concordância, não será possível continuar.',
                })
              }
              type="default"
            >
              Não concordo
            </Button>
          </Col>
          <Col>
            <Button
              loading={sendTerm}
              onClick={() => {
                const now = new Date();
                const formatted = now
                  .toISOString()
                  .slice(0, 19)
                  .replace('T', ' ');
                setSendTerm(true);
                setTimeout(() => {
                  onSend({ type: 'term_of_use', value: formatted });
                }, 1000);
              }}
              type="primary"
            >
              Declaro que li e concordo com os termos de uso
            </Button>
          </Col>
        </Row>
      </Modal>
      <Modal
        className="no-footer"
        closable={false}
        destroyOnHidden
        footer={false}
        open={modalPolitica && politicaData}
        style={{ top: 10 }}
      >
        <Typography className="title-termo">Política de privacidade</Typography>
        <PdfViewerComponent fileUrl={politicaData?.document} />
        <Row gutter={[8, 8]} justify={'center'} style={{ marginTop: 10 }}>
          <Col>
            <Button
              onClick={() =>
                Modal.warning({
                  title: 'Atenção!',
                  content:
                    'Aceitar a política de privacidade é obrigatório para utilizar nossos serviços. Sem essa concordância, não será possível continuar.',
                })
              }
              type="default"
            >
              Não concordo
            </Button>
          </Col>
          <Col>
            <Button
              loading={sendTerm}
              onClick={() => {
                const now = new Date();
                const formatted = now
                  .toISOString()
                  .slice(0, 19)
                  .replace('T', ' ');
                setSendTerm(true);
                setTimeout(() => {
                  onSend({ type: 'privacy_policy', value: formatted });
                }, 1000);
              }}
              type="primary"
            >
              Declaro que li e concordo com a política de privacidade
            </Button>
          </Col>
        </Row>
      </Modal>
    </Row>
  );
};

export default Panel;
