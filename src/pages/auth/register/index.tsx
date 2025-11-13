// react libraries

import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Segmented,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
// icons
import { IoIdCardOutline, IoLockOpenOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
// components
import { InputMaskCorrect } from "@/components/InputMask";

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/mybox-gestao-inteligente-de-cacambas.png`;

import { Card, CardHeader } from "@/components/ui/card";
// services
import { POST_API, POST_CATCH, setToken } from "@/services";

export default function RegisterPage() {
  // router
  const navigate = useNavigate();

  // states
  const [loading, setLoading] = useState<boolean>(false);
  const [doc, setDoc] = useState<string>("cpf");

  // form
  const [form] = Form.useForm();

  // login
  const onSend = async (values: any) => {
    setLoading(true);
    POST_API("/login", values)
      .then((rs) => {
        if (rs.ok) return rs.json();
        message.error("Usuário ou senha inválidos.");
      })
      .then((data) => {
        if (data?.token) {
          setToken(data.token);
          navigate("/profile");
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoading(false));
  };

  // limpar campos quando mudar o tipo de documento
  useEffect(() => {
    form.resetFields();
  }, [doc]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white md:w-1/2 lg:w-1/3">
      <Card className="w-full max-w-sm border-none shadow-none">
        <CardHeader className="flex flex-col items-center p-10">
          <img alt="Mybox Brasil" src={logo} />
        </CardHeader>
      </Card>

      <div className="card-login">
        <Row gutter={[4, 4]}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onSend}
            style={{ width: "100%" }}
          >
            <Col span={24}>
              <Segmented
                block
                onChange={(v) => setDoc(v)}
                options={[
                  { label: "Pessoa física", value: "cpf" },
                  { label: "Pessoa jurídica", value: "cnpj" },
                ]}
                style={{ marginBottom: 6 }}
                value={doc}
              />
              <Form.Item
                name="document_number"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <InputMaskCorrect
                  autoComplete="off"
                  mask={doc === "cpf" ? "999.999.999-99" : "99.999.999/9999-99"}
                  maskChar={""}
                >
                  {() => (
                    <Input
                      addonBefore={<IoIdCardOutline />}
                      maxLength={doc === "cpf" ? 14 : 18}
                      placeholder={
                        doc === "cpf" ? "Digite seu CPF" : "Digite seu CNPJ"
                      }
                      size="large"
                    />
                  )}
                </InputMaskCorrect>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input.Password
                  addonBefore={<IoLockOpenOutline />}
                  placeholder="Digite sua senha"
                  size="large"
                  type="password"
                />
              </Form.Item>
              <Link to={"/esqueceuasenha"}>
                <Typography
                  style={{ float: "right", marginTop: -20, marginBottom: 10 }}
                >
                  {" "}
                  Esqueceu a senha?{" "}
                </Typography>
              </Link>
            </Col>
            <Col span={24}>
              <Button block htmlType="submit" loading={loading} type="primary">
                {" "}
                Entrar{" "}
              </Button>
            </Col>
          </Form>
        </Row>
      </div>
      <Link to={"/cadastrese"}>
        <Button block type="link">
          {" "}
          Crie sua conta!{" "}
        </Button>
      </Link>
    </div>
  );
}
