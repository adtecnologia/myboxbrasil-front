// react libraries

import { Button, Col, Drawer, Form, Input, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import { fromAddress } from 'react-geocode';

// icons
import { TbEdit } from 'react-icons/tb';
// components
import CardItem from '../../../components/CardItem';
import { InputMaskCorrect } from '../../../components/InputMask';
import SelectSearch from '../../../components/SelectSearch';
import Table from '../../../components/Table';
import { TableTrTrashButton } from '../../../components/Table/buttons';
// services
import {
  cleanData,
  GET_API,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from '../../../services';

const Address = () => {
  // state
  const [action, setAction] = useState(false);
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState<any>(null);
  const [loadCEP, setLoadCEP] = useState<any>(false);
  const [loadButton, setLoadButton] = useState<any>(false);
  const [id, setId] = useState<any>(null);
  const [cityName, setCityName] = useState<any>('');
  const [stateAcronym, setStateAcronym] = useState<any>('');

  // form
  const [form] = Form.useForm();

  const column = [
    {
      title: 'Nome',
      dataIndex: 'name',
      table: 'name',
      width: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Endereço',
      dataIndex: 'street',
      table: 'street',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Número',
      dataIndex: 'number',
      table: 'number',
      width: '100px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Bairro',
      dataIndex: 'district',
      table: 'district',
      width: '300px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Cidade',
      dataIndex: 'city.name',
      table: 'cities.name',
      width: '160px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Estado',
      dataIndex: 'city.state.name',
      table: 'states.name',
      width: '160px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Ações',
      dataIndex: null,
      width: '100px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          {verifyConfig(['add.edit']) ? (
            <Col>
              <TbEdit
                className="actions-button"
                onClick={() => onOpen(item)}
                size={18}
              />
            </Col>
          ) : null}
          {item.active ? null : (
            <TableTrTrashButton
              action={() => setAction(!action)}
              item={item}
              path={'address'}
              permission={'add'}
              type="list"
            />
          )}
        </Row>
      ),
    },
  ];

  const onOpen = (item: any) => {
    form.setFieldsValue(cleanData(item));

    setId(item.id);
    setStateAcronym(item.city.state.acronym);
    setCityName(item.city.name);
    setCity({
      search: item.city.name,
      filters: { uf: item.city.state.acronym },
    });

    setOpen(true);
  };

  // load cep
  const onCEP = () => {
    if (
      form.getFieldValue('zip_code') === undefined ||
      form.getFieldValue('zip_code').length < 9
    )
      return;
    setLoadCEP(true);
    GET_API('/cep/' + form.getFieldValue('zip_code'))
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        if (res.erro)
          Modal.warning({ title: 'Algo deu errado', content: 'CEP inválido' });
        else {
          form.setFieldValue('street', res.logradouro);
          form.setFieldValue('district', res.bairro);
          setStateAcronym(res.uf);
          setCityName(res.localidade);
          setCity({
            search: '',
            filters: { uf: res.uf, city: res.localidade },
          });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadCEP(false));
  };

  // function save
  const onSend = (values: any) => {
    const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`;
    setLoadButton(true);
    fromAddress(address)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;

        values.latitude = lat;
        values.longitude = lng;

        POST_API('/address', values, id)
          .then((rs) => {
            if (rs.ok) return rs.json();
            Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
          })
          .then(() => {
            setOpen(false);
            setAction(!action);
          })
          .catch(POST_CATCH)
          .finally(() => setLoadButton(false));
      })
      .catch(() => {
        Modal.warning({
          title: 'Algo deu errado',
          content: 'Não foi possível encontrar endereço',
        });
        setLoadButton(true);
      });
  };

  useEffect(() => {
    if (open === false) {
      form.resetFields();
      setId(null);
    }
  }, [open]);

  return (
    <CardItem
      option={
        verifyConfig(['add.add']) ? (
          <Button
            className="btn-primary"
            onClick={() => setOpen(true)}
            size="small"
            style={{ float: 'right' }}
            type="primary"
          >
            Novo endereço
          </Button>
        ) : null
      }
      title="Endereços"
    >
      <Table
        action={action}
        column={column}
        path={'address'}
        type={'list'}
        useFilter={[
          {
            type: 'search',
            name: 'state',
            label: 'Estado',
            url: '/state',
            labelField: ['acronym', 'name'],
          },
          {
            type: 'search',
            name: 'city',
            label: 'Cidade',
            url: '/city',
            labelField: 'name',
          },
        ]}
      />
      <Drawer onClose={() => setOpen(false)} open={open} title={'Endereços'}>
        <Form form={form} layout="vertical" onFinish={onSend}>
          <Row gutter={[8, 0]}>
            <Col span={24}>
              <Form.Item
                label="Salvar endereço como"
                name="name"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <Input placeholder="Nome" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="CEP"
                name="zip_code"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
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
            <Col span={24}>
              <Form.Item
                label="Logradouro"
                name="street"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <Input disabled={loadCEP} placeholder="Logradouro" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Número"
                name="number"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <Input disabled={loadCEP} placeholder="Número" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Complemento" name="complement">
                <Input disabled={loadCEP} placeholder="Complemento" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Bairro"
                name="district"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <Input disabled={loadCEP} placeholder="Bairro" />
              </Form.Item>
            </Col>
            <Col md={24} xs={24}>
              <Form.Item
                label="Cidade - Estado"
                name="city_id"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <SelectSearch
                  change={(v: any) => form.setFieldValue('city_id', v.value)}
                  disabled={loadCEP}
                  effect={city}
                  labelField={['name', 'state.acronym']}
                  placeholder="Cidade"
                  url="/city"
                  value={form.getFieldValue('city_id')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button block onClick={() => setOpen(false)} type="default">
                Cancelar
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                htmlType="submit"
                loading={loadButton}
                type="primary"
              >
                Salvar
              </Button>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </CardItem>
  );
};

export default Address;
