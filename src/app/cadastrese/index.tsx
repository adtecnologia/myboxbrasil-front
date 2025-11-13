// react libraries
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/performance/noImgElement: ignorar */
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  message,
  Radio,
  Row,
  Segmented,
  Select,
  Tabs,
  Typography,
  Upload,
} from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputMaskCorrect } from "../../components/InputMask";
// components
import SelectSearch from "../../components/SelectSearch";

// css
import "./style.css";

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/mybox-gestao-inteligente-de-cacambas.png`;
const customer = `${import.meta.env.VITE_URL_ASSETS}/cadastro/customer.png`;
const seller = `${import.meta.env.VITE_URL_ASSETS}/cadastro/seller.png`;
const finalDestination = `${import.meta.env.VITE_URL_ASSETS}/cadastro/final_destination.png`;

import PdfViewerComponent from "@/components/PdfComponent";
import { MAX_UPLOAD_FILE } from "@/utils/max-file-upload";
// services
import { GET_API, getUPLOADAPI, POST_API } from "../../services";

const Register = () => {
  // router
  const navigate = useNavigate();

  // states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadCEP, setLoadCEP] = useState<boolean>(false);
  const [cadastrar, setCadastrar] = useState<boolean>(false);
  const [city, setCity] = useState<any>(null);
  const [bank] = useState<any>(null);
  const [type, setType] = useState<
    "" | "customer" | "seller" | "final_destination"
  >("");
  const [doc, setDoc] = useState<string>("cpf");
  const [docAccount, setDocAccount] = useState<string>("cpf");
  const [cityName, setCityName] = useState<string>("");
  const [stateAcronym, setStateAcronym] = useState<string>("");
  const [modalTermos, setModalTermos] = useState<boolean>(false);
  const [modalPolitica, setModalPolitica] = useState<boolean>(false);
  const [termoData, setTermoData] = useState<any>();
  const [politicaData, setPoliticaData] = useState<any>();
  const [termoAceite, setTermoAceite] = useState<string>();
  const [politicaAceite, setPoliticaAceite] = useState<string>();
  const [dadosEnviados, setDadosEnviados] = useState<any>();
  const [tabKey, setTabKey] = useState<number>(1);

  // form
  const [form] = Form.useForm();

  const onAceiteTermos = () => {
    GET_API("/term_of_use/latest")
      .then((rs) => rs.json())
      .then((res) => {
        setLoading(false);
        setModalTermos(true);
        setTermoData(res.data);
      });
  };

  const onAceitePolitica = () => {
    GET_API("/privacy_policy/latest")
      .then((rs) => rs.json())
      .then((res) => {
        setLoading(false);
        setModalPolitica(true);
        setPoliticaData(res.data);
      });
  };

  // salvar
  const onSend = (values: any) => {
    // verifica aceite dos termos
    setDadosEnviados(values);
    setModalPolitica(false);
    setModalTermos(false);
    setLoading(true);
    if (!values?.term_of_use_accept) {
      onAceiteTermos();
      return;
    }
    if (!values?.privacy_policy_accept) {
      onAceitePolitica();
      return;
    }

    // busca latitude e longitude
    const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`;
    GET_API(`/geocode?address=${address}`)
      .then((rs) => rs.json())
      .then((response) => {
        const { lat, lng } = response;

        values.latitude = lat;
        values.longitude = lng;

        values.latitude = lat;
        values.longitude = lng;
        values.document_type = doc;
        values.term_of_use_id = termoData.id;
        values.privacy_policy_id = politicaData.id;

        values.environmental_license =
          values.environmental_license?.file?.response?.url;
        // salva dados
        POST_API("/register", {
          ...values,
          profile_type: String(type).toLocaleUpperCase(),
        })
          .then((rs) => {
            if (rs.ok) {
              return rs.json();
            }
            return rs.json().then((res) => {
              setTermoAceite("");
              setPoliticaAceite("");
              message.error(res.message);
              return Promise.reject();
            });
          })
          .then(() => {
            navigate("/login");
            Modal.success({
              title: "Sucesso",
              content:
                "Sua conta foi criada com sucesso! Por favor, verique seu e-mail para definir sua senha.",
            });
          })
          .finally(() => setLoading(false));
      })
      .catch(() =>
        Modal.warning({
          title: "Algo deu errado",
          content: "Não foi possível encontrar endereço",
        })
      );
  };

  // pesquisa endereço pelo cep
  const onCEP = () => {
    if (
      form.getFieldValue("zip_code") &&
      String(form.getFieldValue("zip_code")).length > 8
    ) {
      setLoadCEP(true);
      GET_API(`/cep/${form.getFieldValue("zip_code")}`)
        .then((rs) => {
          if (rs.ok) {
            return rs.json();
          }
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        })
        .then((res) => {
          if (res.erro) {
            Modal.warning({
              title: "Algo deu errado",
              content: "CEP não encontrado",
            });
          } else {
            form.setFieldValue("street", res.logradouro);
            form.setFieldValue("district", res.bairro);
            setStateAcronym(res.uf);
            setCityName(res.localidade);
            setCity({
              search: "",
              filters: { uf: res.uf, city: res.localidade },
            });
          }
        })
        .catch(() => {
          Modal.warning({
            title: "Algo deu errado",
            content: "CEP não encontrado",
          });
        })
        .finally(() => setLoadCEP(false));
    }
  };

  const onChangeTab = async (key?: string) => {
    let valid = key ?? tabKey + 1;
    if (Number(valid) === 3 && doc === "cpf") {
      valid = Number(valid) + 1;
    }
    if (Number(valid) > Number(tabKey)) {
      if (Number(valid) === 2) {
        await form.validateFields([
          "document_number",
          "name",
          "email",
          "secondary_phone",
        ]);
      }
      if (Number(valid) === 3) {
        await form.validateFields([
          "zip_code",
          "street",
          "number",
          "district",
          "city_id",
        ]);
      }
      if (Number(valid) === 5) {
        await form.validateFields([
          "environmental_license",
          "environmental_license_expiration",
        ]);
      }
    }
    setTabKey(Number(valid));
  };

  const FormTab = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={onSend}
        style={{ width: "100%" }}
      >
        <Typography className="card-title">Preencha seus dados</Typography>
        <center>
          <Segmented
            block
            className="segmented-cell"
            onChange={(v) => setDoc(v)}
            options={[
              { label: "Pessoa física", value: "cpf" },
              { label: "Pessoa jurídica", value: "cnpj" },
            ]}
            style={{ marginBottom: 6 }}
            value={doc}
          />
        </center>
        <center>
          <Segmented
            className="segmented-desk"
            onChange={(v) => setDoc(v)}
            options={[
              { label: "Pessoa física", value: "cpf" },
              { label: "Pessoa jurídica", value: "cnpj" },
            ]}
            style={{ marginBottom: 6 }}
            value={doc}
          />
        </center>
        <Tabs activeKey={String(tabKey)}>
          <Tabs.TabPane forceRender key={"1"} tab="Seus dados">
            <Row className="card-register-fields" gutter={[8, 8]}>
              <Col md={5} xs={24}>
                <Form.Item
                  label="Login"
                  name="document_number"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <InputMaskCorrect
                    autoComplete="off"
                    mask={
                      doc === "cpf" ? "999.999.999-99" : "99.999.999/9999-99"
                    }
                    maskChar={""}
                  >
                    {() => (
                      <Input
                        maxLength={doc === "cpf" ? 14 : 18}
                        placeholder={
                          doc === "cpf" ? "Digite seu CPF" : "Digite seu CNPJ"
                        }
                      />
                    )}
                  </InputMaskCorrect>
                </Form.Item>
              </Col>
              {doc === "cnpj" && (
                <>
                  <Col md={10} xs={24}>
                    <Form.Item
                      label="Razão Social"
                      name="name"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Razão Social" />
                    </Form.Item>
                  </Col>
                  <Col md={9} xs={24}>
                    <Form.Item label="Nome Fantasia" name="fantasy_name">
                      <Input placeholder="Nome Fantasia" />
                    </Form.Item>
                  </Col>
                </>
              )}
              {doc === "cpf" && (
                <Col md={19} xs={24}>
                  <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{ required: true, message: "Campo obrigatório!" }]}
                  >
                    <Input placeholder="Nome" />
                  </Form.Item>
                </Col>
              )}
              <Col md={7} xs={24}>
                <Form.Item
                  label="E-mail Principal"
                  name="email"
                  rules={[
                    { required: true, message: "Campo obrigatório!" },
                    { type: "email", message: "Insira um e-mail válido" },
                  ]}
                >
                  <Input placeholder="E-mail Principal" />
                </Form.Item>
              </Col>
              <Col md={7} xs={24}>
                <Form.Item label="E-mail Secundário" name="secondary_email">
                  <Input placeholder="E-mail Secundário" />
                </Form.Item>
              </Col>
              <Col md={5} xs={12}>
                <Form.Item
                  label="Celular"
                  name="secondary_phone"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <InputMaskCorrect
                    autoComplete="off"
                    mask={"(99) 99999-9999"}
                    maskChar={""}
                  >
                    {() => <Input maxLength={15} placeholder="Celular" />}
                  </InputMaskCorrect>
                </Form.Item>
              </Col>
              <Col md={5} xs={12}>
                <Form.Item label="Telefone" name="phone">
                  <InputMaskCorrect
                    autoComplete="off"
                    mask={"(99) 9999-9999"}
                    maskChar={""}
                  >
                    {() => <Input maxLength={14} placeholder="Telefone" />}
                  </InputMaskCorrect>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender key={"2"} tab="Endereço">
            <Row className="card-register-fields" gutter={[8, 8]}>
              <Col md={3} xs={24}>
                <Form.Item
                  label="CEP"
                  name="zip_code"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <InputMaskCorrect
                    autoComplete="off"
                    mask={"99999-999"}
                    maskChar={""}
                    maxLength={9}
                    onBlur={onCEP}
                  >
                    {() => <Input placeholder="CEP" />}
                  </InputMaskCorrect>
                </Form.Item>
              </Col>
              <Col md={21} xs={24}>
                <Form.Item
                  label="Logradouro"
                  name="street"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <Input disabled={loadCEP} placeholder="Logradouro" />
                </Form.Item>
              </Col>
              <Col md={3} xs={8}>
                <Form.Item
                  label="Número"
                  name="number"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <Input disabled={loadCEP} placeholder="Número" />
                </Form.Item>
              </Col>
              <Col md={9} xs={16}>
                <Form.Item label="Complemento" name="complement">
                  <Input disabled={loadCEP} placeholder="Complemento" />
                </Form.Item>
              </Col>
              <Col md={6} xs={24}>
                <Form.Item
                  label="Bairro"
                  name="district"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <Input disabled={loadCEP} placeholder="Bairro" />
                </Form.Item>
              </Col>
              <Col md={6} xs={24}>
                <Form.Item
                  label="Cidade - Estado"
                  name="city_id"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <SelectSearch
                    change={(v: any) => form.setFieldValue("city_id", v.value)}
                    disabled={loadCEP}
                    effect={city}
                    labelField={["name", "state.acronym"]}
                    placeholder="Cidade"
                    url="/city"
                    value={form.getFieldValue("city_id")}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          {doc === "cnpj" && (
            <Tabs.TabPane forceRender key={3} tab="Responsável">
              <Row className="card-register-fields" gutter={[8, 8]}>
                <Col md={8} xs={24}>
                  <Form.Item label="Responsável - Nome" name="responsible_name">
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
                      mask={"999.999.999-99"}
                      maskChar={""}
                    >
                      {() => (
                        <Input
                          maxLength={14}
                          placeholder={"Responsável - CPF"}
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
                <Col md={5} xs={12}>
                  <Form.Item
                    label="Responsável - Celular"
                    name="responsible_secondary_phone"
                  >
                    <InputMaskCorrect
                      autoComplete="off"
                      mask={"(99) 99999-9999"}
                      maskChar={""}
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
                <Col md={5} xs={12}>
                  <Form.Item
                    label="Responsável - Telefone"
                    name="responsible_phone"
                  >
                    <InputMaskCorrect
                      autoComplete="off"
                      mask={"(99) 9999-9999"}
                      maskChar={""}
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
              </Row>
            </Tabs.TabPane>
          )}
          {type !== "customer" && (
            <Tabs.TabPane forceRender key={4} tab="Licença ambiental">
              <Row className="card-register-fields" gutter={[8, 8]}>
                <Col md={20} xs={24}>
                  <Form.Item
                    label="Licença ambiental"
                    name="environmental_license"
                    rules={[{ required: true, message: "Campo obrigatório!" }]}
                  >
                    <Upload
                      accept="application/pdf"
                      action={getUPLOADAPI}
                      beforeUpload={(file) => {
                        const isPDF = file.type === "application/pdf";
                        const isLt5M =
                          file.size / 1024 / 1024 < MAX_UPLOAD_FILE;

                        if (!isPDF) {
                          message.error("Apenas arquivos PDF são permitidos.");
                          return Upload.LIST_IGNORE; // <- não envia
                        }

                        if (!isLt5M) {
                          message.error(
                            "Tamanho do arquivo maior do que o permitido (5MB)."
                          );
                          return Upload.LIST_IGNORE; // <- não envia
                        }
                      }}
                      maxCount={1}
                      showUploadList={true}
                    >
                      <Button
                        block
                        className="btn-default"
                        shape="round"
                        type="default"
                      >
                        Anexar licença
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col md={4} xs={24}>
                  <Form.Item
                    label="Validade"
                    name="environmental_license_expiration"
                    rules={[{ required: true, message: "Campo obrigatório!" }]}
                  >
                    <Input placeholder="Validade" type="date" />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
          )}
          {(type === "seller" || type === "final_destination") && (
            <Tabs.TabPane forceRender key={5} tab="Conta corrente">
              <Row className="card-register-fields" gutter={[8, 8]}>
                <Col
                  md={24}
                  style={{ marginBottom: cadastrar ? 10 : 20 }}
                  xs={24}
                >
                  <Typography>
                    Deseja cadastrar sua conta corrente agora?
                  </Typography>
                  <Radio.Group
                    onChange={(e) => setCadastrar(e.target.value)}
                    value={cadastrar}
                  >
                    <Radio value={true}>Sim</Radio>
                    <Radio value={false}>Não</Radio>
                  </Radio.Group>
                </Col>
                {cadastrar && (
                  <>
                    <Col md={3} xs={24}>
                      <Form.Item
                        label="Pessoa"
                        name="person"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Select onChange={setDocAccount} placeholder="Pessoa">
                          <Select.Option value="cpf">Física</Select.Option>
                          <Select.Option value="cnpj">Jurídica</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col md={5} xs={24}>
                      <Form.Item
                        label={docAccount === "cpf" ? "CPF" : "CNPJ"}
                        name="owner_name"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <InputMaskCorrect
                          autoComplete="off"
                          mask={
                            docAccount === "cpf"
                              ? "999.999.999-99"
                              : "99.999.999/9999-99"
                          }
                          maskChar={""}
                        >
                          {() => (
                            <Input
                              maxLength={docAccount === "cpf" ? 14 : 18}
                              placeholder={
                                docAccount === "cpf"
                                  ? "Digite seu CPF"
                                  : "Digite seu CNPJ"
                              }
                            />
                          )}
                        </InputMaskCorrect>
                      </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                      <Form.Item
                        label="Titular"
                        name="owner_document"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Input placeholder="Nome" type="text" />
                      </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                      <Form.Item
                        label={
                          docAccount === "cpf"
                            ? "Data nascimento"
                            : "Data abertura"
                        }
                        name="owner_birthdate"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Input
                          placeholder={
                            docAccount === "cpf"
                              ? "Data nascimento"
                              : "Data abertura"
                          }
                          type="date"
                        />
                      </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                      <Form.Item
                        label={"Banco"}
                        name="bank_id"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <SelectSearch
                          change={(v: any) =>
                            form.setFieldValue("bank_id", v.value)
                          }
                          effect={bank}
                          labelField={["code", "name"]}
                          placeholder="Banco"
                          url="/bank"
                          value={form.getFieldValue("bank_id")}
                        />
                      </Form.Item>
                    </Col>
                    <Col md={8} xs={24}>
                      <Form.Item
                        label="Tipo de conta"
                        name="account_type"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Select placeholder="Tipo de conta">
                          <Select.Option value="conta_corrente">
                            Conta corrente
                          </Select.Option>
                          <Select.Option value="conta_poupanca">
                            Conta poupança
                          </Select.Option>
                          <Select.Option value="conta_corrente_conjunta">
                            Conta corrente conjunta
                          </Select.Option>
                          <Select.Option value="conta_poupanca_conjunta">
                            Conta poupança conjunta
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                      <Form.Item
                        label="Agência - número"
                        name="agency_number"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Input placeholder="Agência - número" type="text" />
                      </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                      <Form.Item
                        label="Agência - dígito"
                        name="agency_vd"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Input placeholder="Agência - dígito" type="text" />
                      </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                      <Form.Item
                        label="Conta - número"
                        name="account_number"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Input placeholder="Conta - número" type="text" />
                      </Form.Item>
                    </Col>
                    <Col md={4} xs={24}>
                      <Form.Item
                        label="Conta - dígito"
                        name="account_vd"
                        rules={[
                          { required: true, message: "Campo obrigatório!" },
                        ]}
                      >
                        <Input placeholder="Conta - dígito" type="text" />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>
            </Tabs.TabPane>
          )}
        </Tabs>
        {((type === "customer" && doc === "cpf" && tabKey === 2) ||
          (type === "customer" && doc === "cnpj" && tabKey === 3) ||
          (type === "seller" && tabKey === 5) ||
          (type === "final_destination" && tabKey === 4)) && (
          <Button
            className="button-register"
            htmlType="submit"
            loading={loading}
            type="primary"
          >
            Criar conta
          </Button>
        )}
        {((type === "customer" && doc === "cpf" && tabKey < 2) ||
          (type === "customer" && doc === "cnpj" && tabKey < 3) ||
          (type === "seller" && tabKey < 5) ||
          (type === "final_destination" && tabKey < 4)) && (
          <Button
            className="button-register"
            onClick={() => onChangeTab()}
            type="primary"
          >
            Próximo
          </Button>
        )}
        {tabKey > 1 && (
          <Button
            className="button-register"
            onClick={() =>
              setTabKey(tabKey === 4 && doc === "cpf" ? tabKey - 2 : tabKey - 1)
            }
            style={{ marginRight: 10 }}
            type="default"
          >
            Voltar
          </Button>
        )}
      </Form>
    );
  };

  return (
    <Row className="content-register">
      <Col className="col-login" lg={6} md={24} sm={24} xl={6} xs={24}>
        <img alt="mybox" className="card-logo-register" src={logo} />
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Typography className="card-title">Cadastrar-se como</Typography>
          </Col>
          <Col span={24}>
            <div
              className={`pd-register ${type === "customer" ? "active" : ""}`}
              onClick={() => setType("customer")}
              style={{ backgroundImage: `url(${customer})` }}
            >
              <div className="pd-register-pele" />
              <Typography className="pd-register-texto">
                Locatário
                <br />
                Pedir caçamba
              </Typography>
            </div>
          </Col>
          <Col span={24}>
            <div
              className={`pd-register ${type === "seller" ? "active" : ""}`}
              onClick={() => setType("seller")}
              style={{ backgroundImage: `url(${seller})` }}
            >
              <div className="pd-register-pele" />
              <Typography className="pd-register-texto">
                Locador
                <br />
                Fornecedor
              </Typography>
            </div>
          </Col>
          <Col span={24}>
            <div
              className={`pd-register ${type === "final_destination" ? "active" : ""}`}
              onClick={() => setType("final_destination")}
              style={{ backgroundImage: `url(${finalDestination})` }}
            >
              <div className="pd-register-pele" />
              <Typography className="pd-register-texto">
                Destino final
              </Typography>
            </div>
          </Col>
          <Col span={24}>
            <Link to={"/login"}>
              <Button
                className="button-register"
                key={"loginback"}
                shape="round"
                type="link"
              >
                Já possui conta? Entre aqui!
              </Button>
            </Link>
          </Col>
        </Row>
      </Col>
      <Col className="card-register-div" lg={18} xl={18}>
        <div className={`card-register ${type ? "" : "hide"}`}>
          <FormTab />
        </div>
      </Col>

      <Drawer
        className="drawer-register"
        height={"100vh"}
        onClose={() => setType("")}
        open={!!type}
        placement="bottom"
        title="Preencha seus dados"
      >
        <FormTab />
      </Drawer>
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
        <Row gutter={[8, 8]} justify={"center"} style={{ marginTop: 10 }}>
          <Col>
            <Button
              onClick={() =>
                Modal.warning({
                  title: "Atenção!",
                  content:
                    "Aceitar os termos de uso é obrigatório para utilizar nossos serviços. Sem essa concordância, não será possível continuar.",
                })
              }
              type="default"
            >
              Não concordo
            </Button>
          </Col>
          <Col>
            <Button
              loading={!!termoAceite}
              onClick={() => {
                const now = new Date();
                const formatted = now
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " ");
                setTermoAceite(formatted);
                setTimeout(() => {
                  onSend({ ...dadosEnviados, term_of_use_accept: formatted });
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
        <Row gutter={[8, 8]} justify={"center"} style={{ marginTop: 10 }}>
          <Col>
            <Button
              onClick={() =>
                Modal.warning({
                  title: "Atenção!",
                  content:
                    "Aceitar a política de privacidade é obrigatório para utilizar nossos serviços. Sem essa concordância, não será possível continuar.",
                })
              }
              type="default"
            >
              Não concordo
            </Button>
          </Col>
          <Col>
            <Button
              loading={!!politicaAceite}
              onClick={() => {
                const now = new Date();
                const formatted = now
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " ");
                setPoliticaAceite(formatted);
                setTimeout(() => {
                  onSend({
                    ...dadosEnviados,
                    privacy_policy_accept: formatted,
                  });
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

export default Register;
