// react libraries

import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  message,
  Row,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
// components
import PageDefault from "../../../../components/PageDefault";
import { TableReturnButton } from "../../../../components/Table/buttons";

// services
import {
  cleanData,
  GET_API,
  getProfileID,
  getToken,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  UPLOAD_API,
} from "../../../../services";

const ModelosDeCacambaForm = ({ type, path, permission }: PageDefaultProps) => {
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // states
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [fileList, setFileList] = useState<any>([]);

  // form
  const [form] = Form.useForm();

  // load params
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/${path}/${ID}`)
        .then((rs) => {
          if (rs.ok) {
            return rs.json();
          }
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        })
        .then((res) => {
          form.setFieldsValue(cleanData(res.data));
          setPhotoPreview(res.data.photo);
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // functions save
  const onSend = (values: any) => {
    setLoadButton(true);
    if (photo) {
      values.photo = photo;
    }

    POST_API(`/${path}`, values, ID)
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((_) => {
        message.success("Salvo com sucesso!");
        navigate("..");
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        {
          title: (
            <Link to={type === "list" ? "#" : ".."}>Modelos de Caçamba</Link>
          ),
        },
        { title: type === "add" ? "Novo" : "Editar" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <TableReturnButton permission={permission} type={type} />
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
                  <Col md={3} xs={24}>
                    <Form.Item
                      label="Modelo"
                      name="name"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Modelo" />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item
                      label="Capacidade"
                      name="m3"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input
                        addonAfter="m³"
                        placeholder="Capacidade"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item label="Medida A" name="letter_a">
                      <Input
                        addonAfter="m"
                        placeholder="Medida A"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item label="Medida B" name="letter_b">
                      <Input
                        addonAfter="m"
                        placeholder="Medida B"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item label="Medida C" name="letter_c">
                      <Input
                        addonAfter="m"
                        placeholder="Medida C"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item label="Medida D" name="letter_d">
                      <Input
                        addonAfter="m"
                        placeholder="Medida D"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item label="Medida E" name="letter_e">
                      <Input
                        addonAfter="m"
                        placeholder="Medida E"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Form.Item label="Medida F" name="letter_f">
                      <Input
                        addonAfter="m"
                        placeholder="Medida F"
                        type="number"
                      />
                    </Form.Item>
                  </Col>
                  <Col md={4} xs={24}>
                    <Image
                      src={
                        photoPreview
                          ? photoPreview
                          : "https://www.ladrilar.com.br/wp-content/uploads/2020/12/cinza-escuro.png"
                      }
                      width={"100%"}
                    />
                  </Col>
                  <Col md={20} xs={24}>
                    <Form.Item label="Foto" name="photo">
                      <ImgCrop>
                        <Upload
                          accept="image/jpeg,image/png"
                          action={UPLOAD_API}
                          fileList={fileList}
                          headers={{
                            Authorization: `Bearer ${getToken()}`,
                            Profile: getProfileID(),
                          }}
                          maxCount={1}
                          onChange={({ fileList: newFileList }) => {
                            setFileList(newFileList);
                            setPhoto(newFileList[0]?.response?.url);
                            setPhotoPreview(newFileList[0]?.response?.url_link);
                          }}
                        >
                          <Button>Selecionar foto</Button>
                        </Upload>
                      </ImgCrop>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button
                      htmlType="submit"
                      loading={loadButton}
                      style={{ float: "right", marginLeft: 6 }}
                      type="primary"
                    >
                      Salvar
                    </Button>
                    <Link to={".."}>
                      <Button style={{ float: "right" }} type="default">
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
