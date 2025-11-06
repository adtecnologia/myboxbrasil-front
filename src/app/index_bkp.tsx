/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import {
  Button,
  Col,
  Drawer,
  Form,
  Image,
  Input,
  Layout,
  Row,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
// icons
import {
  IoListOutline,
  IoMailOpenOutline,
  IoMenuOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import { Link } from 'react-router-dom';

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/3.png`;
const cacamba = `${import.meta.env.VITE_URL_ASSETS}/cacamba.jpg`;
const construcao = `${import.meta.env.VITE_URL_ASSETS}/construcao.jpg`;

const Landing = () => {
  // states
  const [scrl, setScrl] = useState(false);
  const [menu, setMenu] = useState(false);

  // refs
  const refInicio = useRef<any>();
  const refSobre = useRef<any>();
  const refContato = useRef<any>();

  // ir para div
  const toRef = (ref: any) => ref?.current?.scrollIntoView();

  // abrir e fechar menu
  const onMenu = () => setMenu(!menu);

  const scrollRef = useRef(null);

  // função que roda assim que carregar o componente
  useEffect(() => {
    const el: any = scrollRef.current;

    const handleScroll = () => {
      setScrl(el.scrollTop > 60);
    };

    if (el) {
      el.addEventListener('scroll', handleScroll);
    }

    // Cleanup
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div style={{ overflow: 'hidden', height: '100vh' }}>
      <Layout.Content
        id="scroll-principal"
        ref={scrollRef}
        style={{ overflowY: 'auto', height: '100vh' }}
      >
        <Row
          align={'middle'}
          className={scrl ? 'navbar-landing active' : 'navbar-landing'}
          justify={'space-between'}
        >
          <Col>
            <Link to={'/'}>
              <Image preview={false} src={logo} width={120} />
            </Link>
          </Col>
          <Col className="menus">
            <Row align={'middle'} gutter={[8, 8]}>
              <Col>
                <Button
                  className="menu-item"
                  onClick={() => toRef(refInicio)}
                  type="text"
                >
                  Início
                </Button>
              </Col>
              <Col>
                <Button
                  className="menu-item"
                  onClick={() => toRef(refSobre)}
                  type="text"
                >
                  Sobre
                </Button>
              </Col>
              <Col>
                <Button
                  className="menu-item"
                  onClick={() => toRef(refContato)}
                  type="text"
                >
                  Contato
                </Button>
              </Col>
              <Col>
                <Link to="login">
                  <Button type="primary">ENTRAR</Button>
                </Link>
              </Col>
            </Row>
          </Col>
          <Col className="menus-out">
            <Row>
              <Col>
                <IoMenuOutline
                  className="icon-menu"
                  onClick={onMenu}
                  size={40}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          align={'middle'}
          className="row-landing"
          justify={'center'}
          ref={refInicio}
        >
          <Col md={12} xs={24}>
            <Typography className="title-1">
              MyBox Gestão Inteligente de Caçambas
            </Typography>
            <Typography className="title-3">
              Daremos início às nossas operações em Ribeirão Preto no dia 1º de
              agosto de 2025. Em seguida, avançaremos para as 80 cidades do
              estado com mais de 100 mil habitantes e, posteriormente,
              expandiremos nossa presença para todo o estado de São Paulo e,
              depois, para todo o Brasil.
            </Typography>
            {/* <Typography className='title-3'>A MyBox Otimiza a Gestão de Resíduos da Construção e Demolição com Tecnologia e Sustentabilidade</Typography> */}
            <center>
              <Button
                onClick={() => toRef(refSobre)}
                size="large"
                type="primary"
              >
                CONHECER MAIS
              </Button>
            </center>
          </Col>
        </Row>
        <Row
          align={'top'}
          className="row-landing-white"
          gutter={[32, 32]}
          ref={refSobre}
        >
          <Col md={12} xs={24}>
            <Typography className="title-1-white">
              SOBRE <span>O MYBOX</span>
            </Typography>
            <Typography className="title-3-white">
              A MyBox é uma plataforma web/mobile composta por seis aplicativos
              inteligentes, desenvolvidos para otimizar toda a cadeia de locação
              de caçambas e o gerenciamento de Resíduos da Construção e
              Demolição (RCD). Somos uma solução pioneira e sustentável, que une
              tecnologia, fiscalização e conformidade ambiental em uma única
              interface.
            </Typography>
            <Typography className="title-3-white">
              Oferecemos suporte completo a empresas, motoristas, clientes,
              destinadores e órgãos públicos — promovendo transparência,
              eficiência operacional e responsabilidade ambiental em cada etapa
              da jornada do resíduo.
            </Typography>
            <Row gutter={[8, 8]} style={{ marginTop: 20 }}>
              <Col lg={8} md={8} sm={24} xl={8} xs={24}>
                <div className="card-static">
                  <Typography className="card-static-title">
                    Presente em
                  </Typography>
                  <Typography className="card-static-value">0</Typography>
                  <Typography className="card-static-title">cidades</Typography>
                </div>
              </Col>
              <Col lg={8} md={8} sm={24} xl={8} xs={24}>
                <div className="card-static">
                  <Typography className="card-static-title">
                    Usado por
                  </Typography>
                  <Typography className="card-static-value">0</Typography>
                  <Typography className="card-static-title">
                    pessoas e empresas
                  </Typography>
                </div>
              </Col>
              <Col lg={8} md={8} sm={24} xl={8} xs={24}>
                <div className="card-static">
                  <Typography className="card-static-title">Mais de</Typography>
                  <Typography className="card-static-value">0</Typography>
                  <Typography className="card-static-title">
                    caçambas cadastradas
                  </Typography>
                </div>
              </Col>
            </Row>
          </Col>
          <Col md={12} xs={24}>
            <div className="image-stack">
              <div
                className="image-stack-item image-stack-item-top aos-init aos-animate"
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <img className="img-fluid rounded-4 shadow-lg" src={cacamba} />
              </div>
              <div
                className="image-stack-item image-stack-item-bottom aos-init aos-animate"
                data-aos="zoom-in"
                data-aos-delay="500"
              >
                <img
                  className="img-fluid rounded-4 shadow-lg"
                  src={construcao}
                />
              </div>
            </div>
          </Col>
          <Col span={24} style={{ marginTop: 20 }}>
            <Row gutter={[16, 38]}>
              <Col lg={24} md={24} sm={24} xl={24} xs={24}>
                <Typography className="title-1-white">
                  Nossa <span>missão</span>
                </Typography>
                <Typography className="title-3-white">
                  Proporcionar uma gestão moderna e segura para caçambas
                  estacionárias, garantindo a destinação correta dos resíduos e
                  fortalecendo o compromisso com o meio ambiente e com a
                  legislação brasileira.
                </Typography>
              </Col>
              <Col lg={24} md={24} sm={24} xl={24} xs={24}>
                <Typography className="title-1-white">
                  <span>Valores</span> Que Nos Movem
                </Typography>
                <Typography className="title-3-white">
                  <span>• Sustentabilidade:</span> ajudamos cidades e empresas a
                  adotarem práticas que respeitam o meio ambiente.
                </Typography>
                <Typography className="title-3-white">
                  <span>• Inovação:</span> investimos em tecnologias como QR
                  Codes, rastreamento em tempo real e automação de certificados.
                </Typography>
                <Typography className="title-3-white">
                  <span>• Transparência:</span> relatórios acessíveis e
                  rastreabilidade total dos resíduos.
                </Typography>
                <Typography className="title-3-white">
                  <span>• Eficiência:</span> redução de erros e mais agilidade
                  na operação de ponta a ponta.
                </Typography>
                <Typography className="title-3-white">
                  <span>• Conformidade </span>legal: alinhados ao SINIR/MMA e
                  demais normas ambientais.
                </Typography>
              </Col>
              <Col lg={24} md={24} sm={24} xl={24} xs={24}>
                <Typography className="title-1-white">
                  O Que a <span>MyBox</span> Entrega
                </Typography>
                <Typography className="title-3-white">
                  • Locação de caçambas com controle em tempo real
                </Typography>
                <Typography className="title-3-white">
                  • Emissão automática de MTRs e CDFs válidos nacionalmente
                </Typography>
                <Typography className="title-3-white">
                  • Controle completo da frota, motoristas, resíduos e destinos
                  finais
                </Typography>
                <Typography className="title-3-white">
                  • Módulo exclusivo de fiscalização pública para prefeituras e
                  órgãos ambientais
                </Typography>
                <Typography className="title-3-white">
                  • Gestão financeira integrada e relatórios detalhados por
                  aplicativo
                </Typography>
                <Typography className="title-3-white">
                  • Sistema conectado ao PGRS Digital e MTR Nacional
                </Typography>
              </Col>
              <Col lg={24} md={24} sm={24} xl={24} xs={24}>
                <Typography className="title-1-white">
                  Uma Marca Que Inspira <span>Confiança</span> e{' '}
                  <span>Evolução</span>
                </Typography>
                <Typography className="title-3-white">
                  Ao ver o logotipo da MyBox, com sua identidade verde e
                  tecnológica, queremos que o público sinta:
                </Typography>
                <Typography className="title-3-white">
                  “Aqui está uma empresa comprometida com o futuro —
                  profissional, inovadora e alinhada às boas práticas
                  ambientais.”
                </Typography>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          align={'middle'}
          className="row-landing-color"
          gutter={[16, 16]}
          justify={'center'}
          ref={refContato}
        >
          <Col lg={10} md={12} sm={16} xl={10} xs={24}>
            <div className="card-detail">
              <Typography className="card-detail-title">
                Entre em contato conosco
              </Typography>
              <Form layout="vertical">
                <Form.Item>
                  <Input
                    addonBefore={<IoPersonOutline />}
                    placeholder="Seu nome"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    addonBefore={<IoMailOpenOutline />}
                    placeholder="Seu e-mail"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    addonBefore={<IoListOutline />}
                    placeholder="Assunto"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Input.TextArea
                    placeholder="Mensagem"
                    rows={8}
                    size="large"
                  />
                </Form.Item>
                <Button block size="large" type="primary">
                  Enviar mensagem
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
        <Row
          align={'middle'}
          className="row-landing-white"
          gutter={[16, 16]}
          style={{ padding: 10 }}
        />
        <Row
          align={'middle'}
          className="row-landing-footer"
          justify={'space-between'}
        >
          <Col style={{ height: 37.5 }}>
            <img src={logo} width={120} />
          </Col>
          <Col>
            <Typography style={{ color: 'white' }}>
              © Copyright | Todos os direitos reservados.
            </Typography>
          </Col>
        </Row>
        <Drawer closable={false} onClose={onMenu} open={menu} width={260}>
          <Row>
            <Col span={24}>
              {' '}
              <div
                className="menu-item-side"
                onClick={() => {
                  toRef(refInicio);
                  onMenu();
                }}
              >
                Início
              </div>{' '}
            </Col>
            <Col span={24}>
              {' '}
              <div
                className="menu-item-side"
                onClick={() => {
                  toRef(refSobre);
                  onMenu();
                }}
              >
                Sobre
              </div>{' '}
            </Col>
            <Col span={24}>
              {' '}
              <div
                className="menu-item-side"
                onClick={() => {
                  toRef(refContato);
                  onMenu();
                }}
              >
                Contato
              </div>{' '}
            </Col>
            <Col span={24} style={{ marginTop: 10 }}>
              {' '}
              <Link to="login">
                <Button block type="primary">
                  ENTRAR
                </Button>
              </Link>{' '}
            </Col>
          </Row>
        </Drawer>
      </Layout.Content>
    </div>
  );
};

export default Landing;
