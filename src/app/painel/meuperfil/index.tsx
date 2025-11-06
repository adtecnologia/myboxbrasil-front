// react libraries
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */

import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Modal,
  message,
  Radio,
  Row,
  Tag,
  Typography,
  Upload,
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEffect, useState } from 'react';
import { fromAddress } from 'react-geocode';

// components
import CardItem from '../../../components/CardItem';
import { InputMaskCorrect } from '../../../components/InputMask';
import LoadItem from '../../../components/LoadItem';
import PageDefault from '../../../components/PageDefault';
import SelectSearch from '../../../components/SelectSearch';

// css
import './styles.css';

// icons
import {
  IoCameraOutline,
  IoIdCardOutline,
  IoLockOpenOutline,
} from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { MAX_UPLOAD_FILE } from '@/utils/max-file-upload';
// services
import {
  cleanData,
  delToken,
  GET_API,
  getProfileID,
  getProfileName,
  getProfileType,
  getToken,
  getUPLOADAPI,
  POST_API,
  POST_CATCH,
} from '../../../services';

const MyProfile = () => {
  // states
  const [user, setUser] = useState<any>(null);
  const [doc, setDoc] = useState<string>('');
  const [loadButton, setLoadButton] = useState<boolean>(false);
  const [loadPassButton, setLoadPassButton] = useState<boolean>(false);
  const [loadCEP, setLoadCEP] = useState(false);
  const [city, setCity] = useState<any>(null);
  const [cityName, setCityName] = useState<any>('');
  const [stateAcronym, setStateAcronym] = useState<any>('');
  const [docAccount, setDocAccount] = useState<string>('cpf');
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [delete2Visible, setDelete2Visible] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // form
  const [form] = Form.useForm();
  const [formPass] = Form.useForm();
  const [formDelete] = Form.useForm();

  // update photo
  const onChangePic = (value: any) => {
    if (value.file.response?.url) {
      message.loading({ content: 'Atualizando foto', key: 'picture' });
      POST_API('/me', { photo: value.file.response?.url })
        .then((rs) => {
          if (rs.ok) {
            load();
            message.success({ content: 'Foto atualizada', key: 'picture' });
          } else {
            message.success({ content: 'Algo deu errado', key: 'picture' });
          }
        })
        .catch(POST_CATCH);
    }
  };

  // update data
  const onSend = (values: any) => {
    message.loading({ content: 'Atualizando dados', key: 'picture' });

    if (
      getProfileType() === 'CUSTOMER_EMPLOYEE' ||
      getProfileType() === 'SELLER_EMPLOYEE' ||
      getProfileType() === 'SELLER_DRIVER' ||
      getProfileType() === 'ADMIN_EMPLOYEE' ||
      getProfileType() === 'FINAL_DESTINATION_EMPLOYEE' ||
      getProfileType() === 'CITY_EMPLOYEE' ||
      getProfileType() === 'TAX'
    ) {
      POST_API('/me', values)
        .then((rs) => {
          if (rs.ok) {
            load();
            message.success({ content: 'Dados atualizados', key: 'picture' });
          } else
            message.success({ content: 'Algo deu errado', key: 'picture' });
        })
        .catch(POST_CATCH)
        .finally(() => setLoadButton(false));
    } else {
      const address = `${values?.zip_code} ${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`;
      fromAddress(address)
        .then(({ results }) => {
          setLoadButton(true);
          const { lat, lng } = results[0].geometry.location;

          values.latitude = lat;
          values.longitude = lng;

          POST_API('/me', values)
            .then((rs) => {
              if (rs.ok) {
                load();
                message.success({
                  content: 'Dados atualizados',
                  key: 'picture',
                });
              } else
                message.success({ content: 'Algo deu errado', key: 'picture' });
            })
            .catch(POST_CATCH)
            .finally(() => setLoadButton(false));
        })
        .catch(() =>
          Modal.warning({
            title: 'Algo deu errado',
            content: 'Não foi possível encontrar endereço',
          })
        );
    }
  };

  // update passsword
  const onSendPass = (values: any) => {
    setLoadPassButton(true);
    GET_API(
      `/change-password?old_password=${values.old_password}&password=${values.password}`
    )
      .then((rs) => {
        if (rs.ok) {
          rs.json().then((res) => {
            Modal.success({
              title: 'Sucesso',
              content: 'Senha alterada com sucesso!',
            });
            formPass.resetFields();
          });
        } else
          Modal.warning({
            title: 'Algo deu errado',
            content: 'Senha atual inválida!',
          });
      })
      .catch(POST_CATCH)
      .finally(() => setLoadPassButton(false));
  };

  // load data
  const load = () => {
    setUser(null);
    GET_API('/me')
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        form.setFieldsValue(cleanData(res.data));
        res.data.address = res.data.address
          ? cleanData(res.data.address)
          : null;
        setUser(res.data);
        setDoc(res.data.document_type);
        setDocAccount(res.data.checking_account_person);
        if (res.data.address?.zip_code) {
          form.setFieldValue('zip_code', res.data.address.zip_code);
          form.setFieldValue('street', res.data.address.street);
          form.setFieldValue('number', res.data.address.number);
          form.setFieldValue('complement', res.data.address.complement);
          form.setFieldValue('district', res.data.address.district);
          setCity({ ID: res.data.address.city.id });
          setStateAcronym(res.data.address.city.state.acronym);
          setCityName(res.data.address.city.name);
        }
      })
      .catch(POST_CATCH);
  };

  // load address
  const onCEP = () => {
    setLoadCEP(true);
    GET_API(`/cep/${form.getFieldValue('zip_code')}`)
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        form.setFieldValue('street', res.logradouro);
        form.setFieldValue('district', res.bairro);
        setStateAcronym(res.uf);
        setCityName(res.localidade);
        setCity({ search: res.localidade, filters: { uf: res.uf } });
      })
      .catch(POST_CATCH)
      .finally(() => setLoadCEP(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onDeleteStep2 = () => {
    setDeleteVisible(false);
    setDelete2Visible(true);
  };

  const onDeleteConfirm = () => {
    Modal.confirm({
      title: 'Esse processo é irreversível!',
      content: 'Tem certeza que deseja deletar sua conta permanentemente?',
      onCancel: () => null,
      cancelText: 'Não',
      okText: 'Sim, quero deletar minha conta',
      onOk: () => formDelete.submit(),
    });
  };

  const onDelete = (values: any) => {
    setDeleteLoading(true);
    POST_API('/delete-account', values)
      .then((rs) => {
        if (rs.ok) {
          message.success('Conta deletada com sucesso.');
          delToken();
          window.location.href = '/';
        } else {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setDeleteLoading(false));
  };

  return (
    <PageDefault items={[{ title: 'Meu Perfil' }]} valid={true}>
      {user ? (
        <Row className="mp-row" gutter={[16, 16]}>
          <Col className="mp-col" flex={'24em'}>
            <CardItem>
              <Row
                align={'middle'}
                justify={'center'}
                style={{ flexDirection: 'column' }}
              >
                <Col>
                  <Avatar className="mp-avatar" src={`${user.photo}`} />
                </Col>
                <ImgCrop
                  modalCancel="Cancelar"
                  modalOk="Atualizar"
                  modalTitle="Editar imagem"
                >
                  <Upload
                    accept="image/jpg,image/jpeg,image/png"
                    action={getUPLOADAPI}
                    beforeUpload={(file) => {
                      const isLt5M = file.size / 1024 / 1024 < MAX_UPLOAD_FILE;

                      const isValidImage =
                        file.type === 'image/jpeg' ||
                        file.type === 'image/jpg' ||
                        file.type === 'image/png';

                      if (!isValidImage) {
                        message.error(
                          'Apenas arquivos JPG, JPEG ou PNG são permitidos.'
                        );
                        return Upload.LIST_IGNORE;
                      }

                      if (!isLt5M) {
                        message.error(
                          'Tamanho do arquivo maior do que o permitido (5MB).'
                        );
                        return Upload.LIST_IGNORE; // <- não envia
                      }
                    }}
                    className="btn-upload-div"
                    headers={{
                      Authorization: `Bearer ${getToken()}`,
                      Profile: getProfileID(),
                    }}
                    maxCount={1}
                    onChange={onChangePic}
                    showUploadList={false}
                  >
                    <Button
                      className="btn-upload"
                      shape="circle"
                      type="primary"
                    >
                      <IoCameraOutline />
                    </Button>
                  </Upload>
                </ImgCrop>
                <Col>
                  <Typography className="mp-name">{user.name}</Typography>
                </Col>
                <Col>
                  <Tag className="mp-type">{getProfileName()}</Tag>
                </Col>
              </Row>
            </CardItem>
            <div style={{ marginTop: '1.2em' }} />
            <CardItem title="Mudar senha">
              <Form form={formPass} layout="vertical" onFinish={onSendPass}>
                <Form.Item
                  label="Senha Atual"
                  name="old_password"
                  rules={[{ required: true, message: 'Campo obrigatório!' }]}
                >
                  <Input.Password placeholder="Senha Atual" />
                </Form.Item>
                <Form.Item
                  label="Senha Nova"
                  name="password"
                  rules={[{ required: true, message: 'Campo obrigatório!' }]}
                >
                  <Input.Password placeholder="Senha Nova" />
                </Form.Item>
                <Button
                  htmlType="submit"
                  loading={loadPassButton}
                  style={{ float: 'right', marginLeft: 6 }}
                  type="primary"
                >
                  Alterar
                </Button>
              </Form>
            </CardItem>
            <div style={{ marginTop: '1.2em' }} />
            <CardItem title="Deletar minha conta">
              <Button
                block
                onClick={() => setDeleteVisible(true)}
                type="primary"
              >
                Quero deletar minha conta
              </Button>
            </CardItem>
          </Col>
          <Col flex={'auto'}>
            <CardItem>
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Row gutter={[8, 8]}>
                  <Col md={4} xs={24}>
                    <Form.Item
                      label="Tipo Pessoa"
                      name="document_type"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Radio.Group
                        disabled={true}
                        onChange={(e) => setDoc(e.target.value)}
                      >
                        <Radio value={'cpf'}>Física</Radio>
                        <Radio value={'cnpj'}>Jurídica</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col md={4} xs={24}>
                    <Form.Item
                      label="Login"
                      name="document_number"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        disabled={true}
                        mask={
                          doc === 'cpf'
                            ? '999.999.999-99'
                            : '99.999.999/9999-99'
                        }
                        maskChar={''}
                      >
                        {() => (
                          <Input
                            disabled={true}
                            maxLength={doc === 'cpf' ? 14 : 18}
                            placeholder={doc === 'cpf' ? 'CPF' : 'CNPJ'}
                          />
                        )}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={doc === 'cnpj' ? 8 : 16} xs={24}>
                    <Form.Item
                      label={doc === 'cnpj' ? 'Razão Social' : 'Nome'}
                      name="name"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input
                        placeholder={doc === 'cnpj' ? 'Razão Social' : 'Nome'}
                      />
                    </Form.Item>
                  </Col>
                  {doc === 'cnpj' ? (
                    <Col md={8} xs={24}>
                      <Form.Item label="Nome Fantasia" name="fantasy_name">
                        <Input placeholder="Nome Fantasia" />
                      </Form.Item>
                    </Col>
                  ) : null}
                  <Col md={7} xs={12}>
                    <Form.Item
                      label="E-mail Principal"
                      name="email"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input placeholder="E-mail Principal" type="email" />
                    </Form.Item>
                  </Col>
                  <Col md={7} xs={12}>
                    <Form.Item label="E-mail Secundário" name="secondary_email">
                      <Input placeholder="E-mail Secundário" type="email" />
                    </Form.Item>
                  </Col>
                  <Col md={5} xs={24}>
                    <Form.Item
                      label="Celular"
                      name="secondary_phone"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'(99) 99999-9999'}
                        maskChar={''}
                      >
                        {() => <Input maxLength={15} placeholder="Celular" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={5} xs={24}>
                    <Form.Item label="Telefone" name="phone">
                      <InputMaskCorrect
                        autoComplete="off"
                        mask={'(99) 9999-9999'}
                        maskChar={''}
                      >
                        {() => <Input maxLength={14} placeholder="Telefone" />}
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col md={24} xs={24}>
                    <Form.Item
                      label="Breve descrição e/ou preferêcias"
                      name="description"
                    >
                      <Input.TextArea
                        placeholder="Breve descrição e/ou preferêcias"
                        rows={4}
                      />
                    </Form.Item>
                  </Col>
                  {doc === 'cnpj' ? (
                    <>
                      <Col md={8} xs={24}>
                        <Form.Item
                          label="Responsável - Nome"
                          name="responsible_name"
                        >
                          <Input placeholder="Responsável - Nome" />
                        </Form.Item>
                      </Col>
                      <Col md={4} xs={24}>
                        <Form.Item
                          label="Responsável - CPF"
                          name="responsible_document"
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'999.999.999-99'}
                            maskChar={''}
                          >
                            {() => (
                              <Input
                                maxLength={14}
                                placeholder={'Responsável - CPF'}
                              />
                            )}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Responsável - Cargo"
                          name="responsible_office"
                        >
                          <Input placeholder="Responsável - Cargo" />
                        </Form.Item>
                      </Col>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Responsável - Departamento"
                          name="responsible_departament"
                        >
                          <Input placeholder="Responsável - Departamento" />
                        </Form.Item>
                      </Col>
                      <Col md={7} xs={24}>
                        <Form.Item
                          label="Responsável - E-mail Principal"
                          name="responsible_email"
                        >
                          <Input placeholder="Responsável - E-mail Principal" />
                        </Form.Item>
                      </Col>
                      <Col md={7} xs={24}>
                        <Form.Item
                          label="Responsável - E-mail Secundário"
                          name="responsible_secondary_email"
                        >
                          <Input placeholder="Responsável - E-mail Secundário" />
                        </Form.Item>
                      </Col>
                      <Col md={5} xs={24}>
                        <Form.Item
                          label="Responsável - Telefone"
                          name="responsible_phone"
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'(99) 9999-9999'}
                            maskChar={''}
                          >
                            {() => (
                              <Input
                                maxLength={14}
                                placeholder="Responsável - Telefone"
                              />
                            )}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col md={5} xs={24}>
                        <Form.Item
                          label="Responsável - Celular"
                          name="responsible_secondary_phone"
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'(99) 99999-9999'}
                            maskChar={''}
                          >
                            {() => (
                              <Input
                                maxLength={15}
                                placeholder="Responsável - Celular"
                              />
                            )}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                    </>
                  ) : null}
                  {getProfileType() === 'CUSTOMER_EMPLOYEE' ||
                  getProfileType() === 'SELLER_EMPLOYEE' ||
                  getProfileType() === 'SELLER_DRIVER' ||
                  getProfileType() === 'ADMIN_EMPLOYEE' ||
                  getProfileType() === 'FINAL_DESTINATION_EMPLOYEE' ||
                  getProfileType() === 'CITY_EMPLOYEE' ||
                  getProfileType() === 'TAX' ? null : (
                    <>
                      <Col md={3} xs={24}>
                        <Form.Item
                          label="CEP"
                          name="zip_code"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <InputMaskCorrect
                            autoComplete="off"
                            mask={'99999-999'}
                            maskChar={''}
                            onBlur={onCEP}
                          >
                            {() => <Input maxLength={9} placeholder="CEP" />}
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col md={21} xs={24}>
                        <Form.Item
                          label="Logradouro"
                          name="street"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <Input disabled={loadCEP} placeholder="Logradouro" />
                        </Form.Item>
                      </Col>
                      <Col md={3} xs={24}>
                        <Form.Item
                          label="Número"
                          name="number"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <Input disabled={loadCEP} placeholder="Número" />
                        </Form.Item>
                      </Col>
                      <Col md={9} xs={24}>
                        <Form.Item label="Complemento" name="complement">
                          <Input disabled={loadCEP} placeholder="Complemento" />
                        </Form.Item>
                      </Col>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Bairro"
                          name="district"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <Input disabled={loadCEP} placeholder="Bairro" />
                        </Form.Item>
                      </Col>
                      <Col md={6} xs={24}>
                        <Form.Item
                          label="Cidade - Estado"
                          name="city_id"
                          rules={[
                            { required: true, message: 'Campo obrigatório!' },
                          ]}
                        >
                          <SelectSearch
                            change={(v: any) =>
                              form.setFieldValue('city_id', v.value)
                            }
                            disabled={loadCEP}
                            effect={city}
                            labelField={['name', 'state.acronym']}
                            placeholder="Cidade"
                            url="/city"
                            value={form.getFieldValue('city_id')}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                  <Col span={24}>
                    <Button
                      htmlType="submit"
                      loading={loadButton}
                      style={{ float: 'right', marginLeft: 6 }}
                      type="primary"
                    >
                      Salvar
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardItem>
          </Col>
        </Row>
      ) : (
        <LoadItem />
      )}
      <Modal
        cancelText="Não."
        okText="Sim, tenho certeza!"
        onCancel={() => setDeleteVisible(false)}
        onOk={onDeleteStep2}
        open={deleteVisible}
        title="Tem certeza que deseja deletar sua conta?"
      >
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Typography style={{ marginBottom: 10 }}>
              Ao solicitar a exclusão da sua conta, iniciaremos um processo
              irreversível. Isso significa que todos os seus dados pessoais
              identificáveis serão permanentemente removidos ou anonimizados,
              conforme determina a Lei Geral de Proteção de Dados (LGPD).
            </Typography>
            <Typography style={{ marginBottom: 10 }}>
              <strong>Atenção:</strong> a exclusão é definitiva e{' '}
              <strong>não poderá ser desfeita</strong>.
            </Typography>
            <Link
              target="_blank"
              to="https://myboxbrasil.com/deletar-minha-conta"
            >
              <Typography style={{ color: 'var(--color03)' }}>
                Clique aqui para saber mais!
              </Typography>
            </Link>
          </Col>
        </Row>
      </Modal>
      <Modal
        cancelText="Cancelar"
        okButtonProps={{ loading: deleteLoading }}
        okText="Deletar minha conta"
        onCancel={() => setDelete2Visible(false)}
        onOk={onDeleteConfirm}
        open={delete2Visible}
        title="Para prosseguir, preencha seus dados de login"
      >
        <Row gutter={[8, 8]} justify={'center'}>
          <Col flex={'300px'}>
            <Form
              form={formDelete}
              layout="vertical"
              onFinish={onDelete}
              style={{ marginTop: 20 }}
            >
              <Form.Item
                label={doc === 'cpf' ? 'Seu CPF' : 'Seu CNPJ'}
                name="document_number"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <InputMaskCorrect
                  autoComplete="off"
                  mask={doc === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99'}
                  maskChar={''}
                >
                  {() => (
                    <Input
                      addonBefore={<IoIdCardOutline />}
                      maxLength={doc === 'cpf' ? 14 : 18}
                      placeholder={
                        doc === 'cpf' ? 'Digite seu CPF' : 'Digite seu CNPJ'
                      }
                      size="large"
                    />
                  )}
                </InputMaskCorrect>
              </Form.Item>
              <Form.Item
                label="Sua senha"
                name="password"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <Input.Password
                  addonBefore={<IoLockOpenOutline />}
                  placeholder="Digite sua senha"
                  size="large"
                  type="password"
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </PageDefault>
  );
};

export default MyProfile;
