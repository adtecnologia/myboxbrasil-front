// BIBLIOTECAS REACT

import {
  Col,
  Image,
  Input,
  List,
  Modal,
  Rate,
  Row,
  Select,
  Switch,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CardItem from '../../../components/CardItem';
import DrawerEndereco from '../../../components/DrawerEndereco';
import LoadItem from '../../../components/LoadItem';
// COMPONENTES
import PageDefault from '../../../components/PageDefault';

// SERVIÇOS
import {
  GET_API,
  getToken,
  IMAGE_NOT_FOUND,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from '../../../services';

// CSS
import './style.css';

// ICONES
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { ThreeCircles } from 'react-loader-spinner';
import { TableReturnButton } from '../../../components/Table/buttons';

const PlaceOrderStationary = () => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  const { ID, TYPE } = useParams<{ ID: any; TYPE: any }>();

  const [cacamba, setCacamba] = useState<any>(null);
  const [typeLocal, setTypeLocal] = useState<'E' | 'I' | ''>('');
  const [address, setAddress] = useState<any>(null);
  const [load, setLoad] = useState<boolean>(false);
  const [image, setImage] = useState<any>(null);

  const [edit, setEdit] = useState<boolean>(false);
  const [compare, setCompare] = useState<number>(1);

  const [qtde, setQtde] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);
  const onOpen = () => setOpen(!open);

  const [residueSelect, setResidueSelect] = useState<any[]>([]);
  const [residueNameSelect, setResidueNameSelect] = useState<any[]>([]);
  const [residuBlockOthers, setResidueBlockOthers] = useState<boolean>(false);
  const [residuBlockD, setResidueBlockD] = useState<boolean>(false);
  const [residuBlockC, setResidueBlockC] = useState<boolean>(false);
  const [residueOpen, setResidueOpen] = useState<boolean>(false);
  const onResidueOpen = () => setResidueOpen(!residueOpen);

  // CARREGA ENDEREÇO ATIVO
  const loadAddress = () => {
    GET_API('/address?active=1')
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length === 0) {
          setOpen(true);
        } else {
          setAddress(res.data[0]);
        }
      });
  };

  // CARREGA MODELO
  const onView = () => {
    GET_API(`/stationary_bucket_group/${ID}`)
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        setCacamba(res.data);
        if (!(res.data.gallery.length > 0)) {
          res.data.gallery = [{ url: IMAGE_NOT_FOUND }];
        }
        setImage(res.data.gallery[0].url);
      });
  };

  // VERIFICA CARRINHO
  const onCart = () => {
    POST_API('/cart/product_view.php', { token: getToken(), ID })
      .then((rs) => rs.json())
      .then((res) => {
        if (res.return) {
          setAddress(res.data.ADDRESS);
          setTypeLocal(res.data.TYPE_LOCAL);
          setQtde(Number(res.data.QTDE));
          setEdit(true);
          setCompare(0);
        }
      });
  };

  const onResidue = (value: any, item: any) => {
    var temp = residueSelect;
    var name = residueNameSelect;
    if (temp.includes(item.id)) {
      temp.splice(temp.indexOf(item.id), 1);
      name.splice(name.indexOf(item.name), 1);
    } else {
      temp.push(item.id);
      name.push(item.name);
    }
    setResidueSelect(temp);
    setResidueNameSelect(name);
    onVerifyResidue();
  };

  const onAdd = () => {
    if (
      address === null ||
      typeLocal === '' ||
      residueSelect.length === 0 ||
      load
    )
      return false;

    setLoad(true);
    POST_API('/cart_product', {
      product_id: ID,
      quantity: qtde,
      days: typeLocal === 'I' ? cacamba.days_internal : cacamba.days_external,
      price:
        typeLocal === 'I' ? cacamba.price_internal : cacamba.price_external,
      address_id: address?.id,
      type_local: typeLocal,
      residues: residueSelect,
    })
      .then((rs) => {
        if (rs.ok) {
          navigate('/painel/carrinho');
        } else {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
  };

  useEffect(() => onView(), [ID]);
  useEffect(() => loadAddress(), [ID]);
  useEffect(() => {
    if (cacamba) {
      if (typeLocal === 'I') setTotal(qtde * Number(cacamba.price_internal));
      if (typeLocal === 'E') setTotal(qtde * Number(cacamba.price_external));
    }
  }, [qtde, typeLocal, cacamba]);
  // useEffect(onCart, [ID])

  const onVerifyResidue = () => {
    setResidueBlockC(
      residueNameSelect.includes('Classe A1') ||
        residueNameSelect.includes('Classe A2') ||
        residueNameSelect.includes('Classe A3') ||
        residueNameSelect.includes('Classe B') ||
        residueNameSelect.includes('Classe D')
    );
    setResidueBlockD(
      residueNameSelect.includes('Classe A1') ||
        residueNameSelect.includes('Classe A2') ||
        residueNameSelect.includes('Classe A3') ||
        residueNameSelect.includes('Classe B') ||
        residueNameSelect.includes('Classe C')
    );
    setResidueBlockOthers(
      residueNameSelect.includes('Classe C') ||
        residueNameSelect.includes('Classe D')
    );
  };

  useEffect(() => {
    onVerifyResidue();
  }, [residueSelect, residueNameSelect]);

  useEffect(() => {
    setTimeout(() => {
      setTypeLocal(TYPE);
    }, 1000);
  });

  return (
    <PageDefault
      items={[
        { title: <Link to="/painel/pedircacamba">Pedir Caçamba</Link> },
        { title: 'Caçamba' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={true} type={'edit'} />
        </Row>
      }
      valid={verifyConfig(['pdd.add'])}
    >
      {cacamba === null ? (
        <LoadItem />
      ) : (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <CardItem>
              <Row gutter={[16, 8]}>
                <Col md={11} style={{ overflow: 'hidden !important' }} xs={24}>
                  <Row gutter={[2, 2]}>
                    <Col span={4}>
                      <Row gutter={[2, 2]}>
                        {cacamba.gallery.map((v: any, i: any) => (
                          <Col key={i} span={24}>
                            <Image
                              onClick={() => setImage(v.url)}
                              preview={false}
                              src={v.url}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '8px',
                                border:
                                  v.url === image
                                    ? '3px solid var(--color02)'
                                    : 'none',
                              }}
                              width={'100%'}
                            />
                          </Col>
                        ))}
                      </Row>
                    </Col>
                    <Col span={20}>
                      <Image
                        src={image}
                        style={{ borderRadius: '8px' }}
                        width={'100%'}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col md={13} xs={24}>
                  <Typography className="card-cacamba-title">
                    {String(cacamba.provider_name).toLocaleUpperCase()}
                  </Typography>
                  <Typography className="cacamba-name">
                    Modelo {cacamba.stationary_bucket_type.name}
                  </Typography>
                  <div className="cacamba-rate" style={{ marginBottom: 38 }}>
                    {' '}
                    {/*<Rate disabled style={{marginRight: 4}}/> (0)*/}{' '}
                  </div>

                  <Row gutter={[8, 8]}>
                    <Col md={9} xs={12}>
                      <Typography className="cacamba-title">
                        Detalhes
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Tipo de tampa:</span> {cacamba.type_lid_name}
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Cor:</span> {cacamba.color}
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Material:</span> {cacamba.material}
                      </Typography>
                    </Col>
                    <Col md={9} xs={12}>
                      <Typography className="cacamba-title">
                        Dimensões
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Comprimento:</span>{' '}
                        {cacamba.stationary_bucket_type.letter_a_name}
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Largura:</span>{' '}
                        {cacamba.stationary_bucket_type.letter_b_name}
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Altura:</span>{' '}
                        {cacamba.stationary_bucket_type.letter_c_name}
                      </Typography>
                    </Col>
                    <Col md={6} xs={24}>
                      <Typography className="cacamba-title">
                        Disponíveis
                      </Typography>
                      <Typography className="cacamba-desc">
                        {cacamba.stock} cacambas
                      </Typography>
                      <Typography
                        className="cacamba-link"
                        style={{ marginTop: 6 }}
                      >
                        Ficha Técnica
                      </Typography>
                    </Col>
                  </Row>

                  <Typography className="cacamba-title">
                    Escolher tipo de locação
                  </Typography>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <Select
                        defaultValue={TYPE}
                        onChange={setTypeLocal}
                        placeholder="Selecione um tipo de locação"
                        style={{ width: '100%' }}
                      >
                        {cacamba.days_internal ? (
                          <Select.Option value={'I'}>
                            Locação Interna | até {cacamba.days_internal} dias
                          </Select.Option>
                        ) : null}
                        {cacamba.days_external ? (
                          <Select.Option value={'E'}>
                            Locação Externa | até {cacamba.days_external} dias
                          </Select.Option>
                        ) : null}
                      </Select>
                    </Col>
                    {/* { cacamba.type_local === 'B' || cacamba.type_local === 'E' ? <Col><Tag className={`mf-tag ${typeLocal === 'E' ? 'active' : ''}`} onClick={() => setTypeLocal('E')}></Tag></Col> : null }
                                        { cacamba.type_local === 'B' || cacamba.type_local === 'I' ? <Col><Tag className={`mf-tag ${typeLocal === 'I' ? 'active' : ''}`} onClick={() => setTypeLocal('I')}></Tag></Col> : null } */}
                  </Row>

                  <Typography className="cacamba-title">
                    Escolher endereço de entrega
                  </Typography>
                  <Input
                    addonBefore={
                      <Typography className="cacamba-address" onClick={onOpen}>
                        {address === null ? 'Selecionar' : 'Mudar'} endereço
                      </Typography>
                    }
                    readOnly
                    value={`${address?.street}, ${address?.number} - ${address?.district} - ${address?.city.name} / ${address?.city.state.acronym}`}
                  />

                  <Typography className="cacamba-title">
                    Escolher classe de resíduo
                  </Typography>
                  <Input
                    addonBefore={
                      <Typography
                        className="cacamba-address"
                        onClick={onResidueOpen}
                      >
                        Escolher classes
                      </Typography>
                    }
                    placeholder="Nenhuma classe selecionada"
                    readOnly
                    value={residueNameSelect.map((v: any) => v)}
                  />
                  <Modal
                    cancelButtonProps={{ style: { display: 'none' } }}
                    destroyOnClose={true}
                    okText={'Fechar'}
                    onCancel={onResidueOpen}
                    onOk={onResidueOpen}
                    open={residueOpen}
                    style={{ top: 20 }}
                    title="Escolher classes de resíduos"
                    width={'100%'}
                  >
                    <List
                      bordered
                      dataSource={cacamba?.residues}
                      itemLayout="horizontal"
                      locale={{ emptyText: 'Nenhum resíduo encontrado' }}
                      renderItem={(item: any) => (
                        <List.Item
                          actions={[
                            <Switch
                              defaultChecked={residueSelect.includes(item.id)}
                              disabled={
                                (item.name === 'Classe C' && residuBlockC) ||
                                (item.name === 'Classe D' && residuBlockD) ||
                                (item.name !== 'Classe C' &&
                                  item.name !== 'Classe D' &&
                                  residuBlockOthers)
                              }
                              onChange={(v) => onResidue(v, item)}
                            />,
                          ]}
                        >
                          <List.Item.Meta
                            description={item.description}
                            title={item.name}
                          />
                        </List.Item>
                      )}
                      size="small"
                    />
                  </Modal>

                  {cacamba.stock > 0 ? (
                    <Row
                      align={'middle'}
                      className="cacamba-footer"
                      gutter={[16, 16]}
                    >
                      <Col md={12} xs={8}>
                        <Row align={'middle'} gutter={[22, 22]} justify={'end'}>
                          <Col style={{ height: 14 }}>
                            <FaMinus
                              className={`cacamba-plus ${qtde === compare ? 'disabled' : ''}`}
                              onClick={() =>
                                setQtde(qtde === compare ? qtde : qtde - 1)
                              }
                            />
                          </Col>
                          <Col>
                            <Typography className="cacamba-qtde">
                              {qtde}
                            </Typography>
                          </Col>
                          <Col style={{ height: 14 }}>
                            <FaPlus
                              className={`cacamba-plus ${qtde < Number(cacamba.stock) ? '' : 'disabled'}`}
                              onClick={() =>
                                setQtde(
                                  qtde < Number(cacamba.stock) ? qtde + 1 : qtde
                                )
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md={12} xs={16}>
                        <div
                          className={`carrinho-button ${address === null || typeLocal === '' || residueSelect.length === 0 ? 'disabled' : ''}`}
                          onClick={onAdd}
                        >
                          <Typography className="carrinho-button-text">
                            {load ? (
                              <ThreeCircles
                                ariaLabel="grid-loading"
                                color={'#fff'}
                                height="20"
                                visible={true}
                                width="20"
                                wrapperClass="grid-wrapper"
                              />
                            ) : edit ? (
                              qtde > 0 ? (
                                'Atualizar'
                              ) : (
                                'Remover'
                              )
                            ) : (
                              'Confirmar pedido'
                            )}
                          </Typography>
                          <Typography className="carrinho-button-text">
                            R$ {total.toFixed(2)}
                          </Typography>
                        </div>
                      </Col>
                    </Row>
                  ) : null}
                </Col>
              </Row>
            </CardItem>
          </Col>
          <DrawerEndereco
            address={address}
            close={() => setOpen(false)}
            open={open}
            provider={cacamba?.provider_id}
            setAddress={setAddress}
          />
        </Row>
      )}
    </PageDefault>
  );
};

export default PlaceOrderStationary;
