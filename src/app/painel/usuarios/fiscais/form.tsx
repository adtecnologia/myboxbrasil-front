// react libraries
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, Input, Modal, Radio, Row, message } from "antd";

// components
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
import { InputMaskCorrect } from "../../../../components/InputMask";
import { TableReturnButton } from "../../../../components/Table/buttons";

// services
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, cleanData, getProfileType } from "../../../../services";

const TaxForm = ({ type, path, permission }: PageDefaultProps) => {

  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // states
  const [ load, setLoad ] = useState<boolean>(true);
  const [ doc, setDoc ] = useState('cpf');
  const [ loadButton, setLoadButton ] = useState<boolean>(false);
  const [ per, setPer ] = useState<string[]>([]);

  // form
  const [form] = Form.useForm();



  // valid params
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/user/${ID}`).then((rs) => {
        if (rs.ok) return rs.json();
        else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }).then((res) => {
        form.setFieldsValue(cleanData(res.data));
        setPer(res.data.permissions);
        setDoc(res.data.document_type)
      }).catch(POST_CATCH).finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // function save
  const onSend = (values: any) => {

    setLoadButton(true);

    values.profile_type = 'tax'

    values.permission = per
    
    POST_API(`/user`, values, ID).then((rs) => {
      if (rs.ok) {
        message.success("Salvo com sucesso!");
        navigate("..");
      } else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
    }).catch(POST_CATCH).finally(() => setLoadButton(false));

  };

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
      { title: <Link to={type === "list" ? "#" : ".."}>Fiscais</Link> },
      { title: type === "add" ? "Novo" : "Editar" },
    ]} options={
      <Row justify={"end"} gutter={[8, 8]}>
        <TableReturnButton type={type} permission={permission} />
      </Row>
    }>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Form layout="vertical" form={form} onFinish={onSend}>
                <Row gutter={[8, 8]}>
                  <Col xs={24} md={4}>
                    <Form.Item name="document_type" label="Tipo Pessoa" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Radio.Group onChange={(e) => setDoc(e.target.value)} disabled={type === "edit"}>
                        <Radio value={'cpf'}>Física</Radio>
                        <Radio value={'cnpj'}>Jurídica</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name="document_number" label="Login" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <InputMaskCorrect disabled={type === "edit"} maskChar={''} autoComplete="off"  mask={ doc === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99' }>
                        { () => <Input disabled={type === "edit"} maxLength={ doc === 'cpf' ? 14 : 18 } placeholder={ doc === 'cpf' ? 'CPF' : 'CNPJ' } /> }
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  {doc === 'cnpj' ? (
                    <>
                      <Col xs={24} md={6}>
                        <Form.Item name="name" label="Razão Social" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                          <Input placeholder="Razão Social" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="fantasy_name" label="Nome Fantasia">
                          <Input placeholder="Nome Fantasia" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="state_registration" label="Inscrição Estadual">
                          <Input placeholder="Inscrição Estadual" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="municipal_registration" label="Inscrição Municipal">
                          <Input placeholder="Inscrição Municipal" />
                        </Form.Item>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col xs={24} md={16}>
                        <Form.Item name="name" label="Nome" rules={[   { required: true, message: "Campo obrigatório!" }, ]}>
                          <Input placeholder="Nome" />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                  <Col xs={24} md={ doc === 'cnpj' ? 6 : 7}>
                    <Form.Item name="email" label="E-mail Principal" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input placeholder="E-mail Principal" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={ doc === 'cnpj' ? 6 : 7}>
                    <Form.Item name="secondary_email" label="E-mail Secundário">
                      <Input placeholder="E-mail Secundário" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={ doc === 'cnpj' ? 4 : 5}>
                    <Form.Item name="secondary_phone" label="Celular" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 99999-9999"}>
                        { () => <Input maxLength={15}  placeholder="Celular"/> }
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={ doc === 'cnpj' ? 4 : 5}>
                    <Form.Item name="phone" label="Telefone">
                      <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 9999-9999"}>
                        { () => <Input maxLength={15} placeholder="Telefone" /> }
                      </InputMaskCorrect>
                    </Form.Item>
                  </Col>
                  {doc === 'cnpj' ? (
                    <>
                      <Col xs={24} md={8}>
                        <Form.Item name="responsible_name" label="Responsável - Nome">
                          <Input placeholder="Responsável - Nome" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="responsible_document" label="Responsável - CPF">
                          <InputMaskCorrect maskChar={''} autoComplete="off"  mask={'999.999.999-99'}>
                            { () => <Input maxLength={14} placeholder={'Responsável - CPF'} /> }
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="responsible_office" label="Responsável - Cargo">
                          <Input placeholder="Responsável - Cargo" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="responsible_departament" label="Responsável - Departamento">
                          <Input placeholder="Responsável - Departamento" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item name="responsible_email" label="Responsável - E-mail Principal">
                          <Input placeholder="Responsável - E-mail Principal" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item name="responsible_secondary_email" label="Responsável - E-mail Secundário">
                          <Input placeholder="Responsável - E-mail Secundário" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item name="responsible_phone" label="Responsável - Telefone">
                          <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 9999-9999"}>
                            { () => <Input maxLength={14} placeholder="Responsável - Telefone" /> }
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item name="responsible_secondary_phone" label="Responsável - Celular">
                          <InputMaskCorrect maskChar={''} autoComplete="off"  mask={"(99) 99999-9999"}>
                            { () => <Input maxLength={15} placeholder="Responsável - Celular" /> }
                          </InputMaskCorrect>
                        </Form.Item>
                      </Col>
                    </>
                  ) : null}
                  <Col span={24}>
                    <Button  htmlType="submit" type="primary" style={{ float: "right", marginLeft: 6 }} loading={loadButton}> Salvar </Button>
                    <Link to={".."}>
                      <Button  type="default" style={{ float: "right" }}> Cancelar </Button>
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

export default TaxForm;