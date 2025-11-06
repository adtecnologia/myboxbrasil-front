// react libraries
import { useEffect, useState } from "react";
import { Button, Col, Form, Image, Input, Row, message, Segmented, Typography, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";

// components
import { InputMaskCorrect } from "../../components/InputMask";

// icons
import { IoIdCardOutline, IoLockOpenOutline, IoMailOpenOutline } from "react-icons/io5";

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/mybox-gestao-inteligente-de-cacambas.png`;

// services
import { POST_API, POST_CATCH, setToken } from "../../services";

const Forgot = () => {
  
  // router
  const navigate = useNavigate();

  // states
  const [loading, setLoading] = useState<boolean>(false);
  const [doc, setDoc]         = useState<string>('cpf');

  // form
  const [form] = Form.useForm();

  // login
  const onSend = async (values: any) => {
    setLoading(true);
    POST_API(`/forgot`, values) .then((rs) => {
      if (rs.ok) return rs.json();
      else message.error("Erro ao enviar e-mail!");
    }).then((data) => {
      if (data.type === 'success'){
        Modal.success({title: 'Sucesso', content: 'Um e-mail foi enviado para você!'})
        navigate("/login");
      } else {
        Modal.warning({title: 'Atenção', content: data.message})
      }
    }).catch(POST_CATCH).finally(() => setLoading(false));
  };

  // limpar campos quando mudar o tipo de documento
  useEffect(() => {
    form.resetFields();
  }, [doc]);

  return (
    <Row className="content-login">
      <Col xl={8} lg={9} md={10} sm={24} xs={24} className="col-login">
        <div className="card-logo-div">
          <img src={logo}  className="card-logo" />
        </div>
        <div className="card-login">
        <Typography className="login-title" style={{textAlign: 'center', fontSize: '1.2em', marginBottom: 20, marginTop: -20}}>Enviaremos um e-mail para recuperar sua senha</Typography>
          <Row gutter={[4,4]}>
            <Form style={{ width: "100%" }} onFinish={onSend} form={form} layout="vertical">
              <Col span={24}>
                <Form.Item name="email" rules={[{ required: true, message: "Campo obrigatório!" }, {type: 'email', message: 'E-maill inválido'}]} >
                    <Input addonBefore={<IoMailOpenOutline />} placeholder="Digite seu e-mail" size="large"/>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Button type="primary" loading={loading} shape="round" block htmlType="submit"> Enviar e-mail de recuperação </Button>
                <Link to={'/login'}>
                  <Button type="link" shape="round" block>  Voltar </Button>
                </Link> 
              </Col>
            </Form>
          </Row>
        </div>
      </Col>
    </Row>
  );
};

export default Forgot;
