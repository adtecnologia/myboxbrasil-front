// react libraries
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Form, Image, Input, Modal, Row, Upload, message } from "antd";
import ImgCrop from "antd-img-crop";

// components
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
import { TableReturnButton } from "../../../../components/Table/buttons";

// services
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, UPLOAD_API, cleanData, getProfileID, getToken } from "../../../../services";

const ModelosDeCacambaForm = ({ type, path, permission }: PageDefaultProps) => {
  
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // states
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [photo, setPhoto] = useState("");
  const [fileList, setFileList] = useState<any>([]);

  // form
  const [form] = Form.useForm();

  // load params
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/${path}/${ID}`).then((rs) => {
        if (rs.ok) return rs.json();
        else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }).then((res) => {
          form.setFieldsValue(cleanData(res.data));
          setPhoto(res.data.photo);
      }).catch(POST_CATCH).finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // functions save
  const onSend = (values: any) => {
    setLoadButton(true);
    values.photo = photo;
    POST_API(`/${path}`, values, ID).then((rs) => {
      if (rs.ok) return rs.json();
      else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
    }).then((data) => {
        message.success("Salvo com sucesso!");
        navigate("..");
    }).catch(POST_CATCH).finally(() => setLoadButton(false));
  };

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
      { title: <Link to={type === "list" ? "#" : ".."}>Modelos de Caçamba</Link> },
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
                  <Col xs={24} md={3}>
                    <Form.Item name="name" label="Modelo" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input placeholder="Modelo" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="m3" label="Capacidade em toneladas" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Capacidade em toneladas" addonAfter="t"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="letter_a" label="Medida A" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Medida A" addonAfter="m" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="letter_b" label="Medida B" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Medida B" addonAfter="m"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="letter_c" label="Medida C" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Medida C" addonAfter="m"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="letter_d" label="Medida D" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Medida D" addonAfter="m"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="letter_e" label="Medida E" rules={[ { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Medida E" addonAfter="m"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={3}>
                    <Form.Item name="letter_f" label="Medida F" rules={[   { required: true, message: "Campo obrigatório!" }, ]}>
                      <Input type="number" placeholder="Medida F" addonAfter="m"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Image src={ photo ? photo : "https://www.ladrilar.com.br/wp-content/uploads/2020/12/cinza-escuro.png" } width={"100%"} />
                  </Col>
                  <Col xs={24} md={20}>
                    <Form.Item name="photo" label="Foto">
                      <ImgCrop>
                        <Upload
                          accept="image/jpeg,image/png"
                          action={UPLOAD_API}
                          headers={{
                            Authorization: "Bearer " + getToken(),
                            Profile: getProfileID(),
                          }}
                          maxCount={1}
                          fileList={fileList}
                          onChange={({ fileList: newFileList }) => {
                            setFileList(newFileList);
                            setPhoto(newFileList[0]?.response?.url);
                          }}
                        >
                          <Button>Selecionar foto</Button>
                        </Upload>
                      </ImgCrop>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button  htmlType="submit" type="primary" style={{ float: "right", marginLeft: 6 }} loading={loadButton}>
                      Salvar
                    </Button>
                    <Link to={".."}>
                      <Button  type="default" style={{ float: "right" }}>
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

export default ModelosDeCacambaForm;
