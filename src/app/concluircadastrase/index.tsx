/** biome-ignore-all lint/performance/useTopLevelRegex: ignorar */
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/performance/noImgElement: ignorar */
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  message,
  Row,
  Typography,
} from 'antd';
import { useState } from 'react';
// icons
import { IoLockOpenOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/mybox-gestao-inteligente-de-cacambas.png`;

// services
import { POST_API, POST_CATCH } from '../../services';

const FinishRegister = () => {
  // router
  const navigate = useNavigate();

  // params
  const { token } = useParams();

  // states
  const [loading, setLoading] = useState<boolean>(false);

  // form
  const [form] = Form.useForm();

  // login
  const onSend = (values: any) => {
    if (values.password !== values.confirm_password) {
      message.warning('Senhas não coincidem.');
      return;
    }
    setLoading(true);
    POST_API('/finish', { ...values, token })
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        message.error('Senhas não coincidem!');
      })
      .then((_) => {
        Modal.success({
          title: 'Sucesso',
          content: 'Parabéns, você está pronto para usar nosso sistema!',
        });
        navigate('/login');
      })
      .catch(POST_CATCH)
      .finally(() => setLoading(false));
  };

  return (
    <Row className="content-login">
      <Col className="col-login" lg={9} md={10} sm={24} xl={8} xs={24}>
        <div className="card-logo-div">
          <img alt="MyBox Brasil" className="card-logo" src={logo} />
        </div>
        <div className="card-login">
          <Typography
            className="login-title"
            style={{
              textAlign: 'center',
              fontSize: '1.2em',
              marginBottom: 20,
              marginTop: -20,
            }}
          >
            Seu cadastro está quase concluido! Por favor, defina sua senha
          </Typography>
          <Row gutter={[4, 4]}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSend}
              style={{ width: '100%' }}
            >
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Campo obrigatório!',
                  },
                  {
                    min: 8,
                    message: 'Sua senha deve ter pelo menos 8 caracteres.',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      } // o "required" já cobre campo vazio

                      const hasUpperCase = /[A-Z]/.test(value);
                      const hasLowerCase = /[a-z]/.test(value);
                      const hasNumber = /\d/.test(value);
                      const hasSpecialChar = /[\W_]/.test(value); // símbolos como @, #, !

                      const isTooSimple =
                        /^([a-zA-Z])\1+$/.test(value) || // aaa, BBB, etc.
                        /^(\d)\1+$/.test(value); // 11111111, etc.

                      if (
                        !(
                          hasUpperCase &&
                          hasLowerCase &&
                          hasNumber &&
                          hasSpecialChar
                        )
                      ) {
                        return Promise.reject(
                          new Error(
                            'Use letras maiúsculas, minúsculas, números e caracteres especiais.'
                          )
                        );
                      }

                      if (isTooSimple) {
                        return Promise.reject(
                          new Error(
                            'Sua senha é muito simples. Escolha algo mais forte.'
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password
                  addonBefore={<IoLockOpenOutline />}
                  placeholder="Digite sua senha"
                  size="large"
                  type="password"
                />
              </Form.Item>
              <Form.Item
                name="confirm_password"
                rules={[{ required: true, message: 'Campo obrigatório!' }]}
              >
                <Input.Password
                  addonBefore={<IoLockOpenOutline />}
                  placeholder="Confirme sua senha"
                  size="large"
                  type="password"
                />
              </Form.Item>
              <Button
                block
                htmlType="submit"
                loading={loading}
                shape="round"
                type="primary"
              >
                Concluir cadastro
              </Button>
            </Form>
          </Row>
        </div>
      </Col>
    </Row>
  );
};

export default FinishRegister;
