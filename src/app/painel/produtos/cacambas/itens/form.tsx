// BIBLIOTECAS REACT

import { Button, Col, Form, Input, Modal, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CardItem from '../../../../../components/CardItem';
import LoadItem from '../../../../../components/LoadItem';

// COMPONENTES
import PageDefault from '../../../../../components/PageDefault';
import { TableReturnButton } from '../../../../../components/Table/buttons';
// SERVIÇOS
import {
  GET_API,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../../services';

const StationaryBucketItensForm = ({
  type,
  path,
  permission,
}: PageDefaultProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // PARAMETROS
  const { ID, ID2 } = useParams();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);

  // CAMPOS FORMULARIO
  const [form] = Form.useForm();

  // VERIFICA "NOVO" OU "EDITAR"
  useEffect(() => {
    if (type === 'add') {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/${path}/${ID2}`)
        .then((rs) => {
          if (rs.ok) {
            return rs.json();
          }
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        })
        .then((res) => {
          form.setFieldsValue(res.data);
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    setLoadButton(true);
    // values.id = ID2;

    values.stationary_bucket_group_id = ID;
    POST_API(`/${path}`, values, ID2)
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
          navigate('../..');
        } else {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        { title: <Link to="/painel/cacambas">Caçambas</Link> },
        { title: <Link to={type === 'list' ? '#' : '..'}>Itens</Link> },
        { title: type === 'add' ? 'Novo' : 'Editar' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton link="../.." permission={permission} type={type} />
        </Row>
      }
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Row gutter={[8, 8]}>
                  <Col md={24} xs={24}>
                    <Form.Item
                      label="Código Identificação"
                      name="code"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input placeholder="Código Identificação" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button
                      htmlType="submit"
                      loading={loadButton}
                      style={{ float: 'right', marginLeft: 6 }}
                      type="primary"
                    >
                      Salvar
                    </Button>
                    <Link to={'../..'}>
                      <Button style={{ float: 'right' }} type="default">
                        Cancelar
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Form>
            </CardItem>
          )}
        </Col>
      </Row>
    </PageDefault>
  );
};

export default StationaryBucketItensForm;
