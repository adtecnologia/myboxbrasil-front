// BIBLIOTECAS REACT
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { fromAddress } from "react-geocode";

// ICONES
import { IoSearch } from "react-icons/io5";

// CSS
import "./style.css";

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH } from "../../services";
import { InputMaskCorrect } from "../InputMask";
import LoadItem from "../LoadItem";
// COMPONENTES
import SelectSearch from "../SelectSearch";

// INTERFACE
interface DrawerEnderecoInterface {
  open: boolean;
  close: any;
  address: any;
  setAddress: any;
  disabledClose?: boolean;
  provider?: number;
}

const DrawerEndereco = ({
  open,
  close,
  address,
  setAddress,
  disabledClose = false,
  provider = 0,
}: DrawerEnderecoInterface) => {
  // ESTADOS DO COMPONENTE
  const [newAddress, setNewAddress] = useState<boolean>(false);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [loadCEP, setLoadCEP] = useState<any>(false);
  const [loadButton, setLoadButton] = useState<any>(true);
  const [city, setCity] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [cityName, setCityName] = useState<any>("");
  const [stateAcronym, setStateAcronym] = useState<any>("");

  const onNewAddress = () => setNewAddress(!newAddress);

  // FUNÇÃO BUSCAR CEP
  const onCEP = () => {
    setLoadCEP(true);
    GET_API("/cep/" + form.getFieldValue("zip_code"))
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        console.log(res);
        form.setFieldValue("street", res.logradouro);
        form.setFieldValue("district", res.bairro);
        setStateAcronym(res.uf);
        setCityName(res.localidade);
        setCity({ search: "", filters: { uf: res.uf, city: res.localidade } });
      })
      .catch(POST_CATCH)
      .finally(() => setLoadCEP(false));
  };

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`;
    setLoadButton(true);
    fromAddress(address)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;

        values.latitude = lat;
        values.longitude = lng;

        POST_API("/address", values)
          .then((rs) => {
            if (rs.ok) {
              return rs.json();
            }
            Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          })
          .then(() => {
            setNewAddress(false);
            onSearch();
          })
          .catch(POST_CATCH)
          .finally(() => setLoadButton(false));
      })
      .catch(() =>
        Modal.warning({
          title: "Algo deu errado",
          content: "Não foi possível encontrar endereço",
        })
      );
  };

  // FUNÇÃO PESQUISAR
  const onSearch = () => {
    setLoadButton(true);

    GET_API(`/address?search=${search}&provider=${provider}`)
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        setAddressList(res.data);
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (open) onSearch();
  }, [search, open]);

  useEffect(() => {
    close();
  }, [address]);

  return (
    <Drawer
      onClose={disabledClose ? () => {} : close}
      open={open}
      title="Selecionar endereço"
    >
      {newAddress ? (
        <Form form={form} layout="vertical" onFinish={onSend}>
          <Row gutter={[8, 0]}>
            <Col span={24}>
              <Form.Item
                label="Salvar endereço como"
                name="name"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input placeholder="Nome" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="CEP"
                name="zip_code"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <InputMaskCorrect
                  autoComplete="off"
                  mask={"99999-999"}
                  maskChar={""}
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
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input disabled={loadCEP} placeholder="Logradouro" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Número" name="number">
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
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input disabled={loadCEP} placeholder="Bairro" />
              </Form.Item>
            </Col>
            <Col md={24} xs={24}>
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
            <Col span={12}>
              <Button block onClick={onNewAddress} type="default">
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
      ) : (
        <Row gutter={[8, 16]}>
          <Col span={24}>
            <Input
              onChange={(v) => setSearch(v.target.value)}
              placeholder="Buscar em endereço"
              prefix={<IoSearch color="var(--color02)" />}
              size="large"
              value={search}
            />
          </Col>
          {loadButton ? (
            <Col span={24}>
              <LoadItem type="alt" />
            </Col>
          ) : addressList.length > 0 ? (
            addressList.map((v, i) => (
              <Col key={i} span={24}>
                <Card hoverable onClick={() => setAddress(v)} size="small">
                  <Typography className="ad-title">{v.name}</Typography>
                  <Typography>
                    {v.street}, {v.number} - {v.district} - {v.city.name} /{" "}
                    {v.city.state.acronym}
                  </Typography>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Typography>Não há mais endereços</Typography>
            </Col>
          )}
          <Col span={24}>
            <Button block onClick={onNewAddress} type="primary">
              Novo endereço
            </Button>
          </Col>
        </Row>
      )}
    </Drawer>
  );
};

export default DrawerEndereco;
