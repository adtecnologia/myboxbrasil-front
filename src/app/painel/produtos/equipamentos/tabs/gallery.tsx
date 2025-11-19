// BIBLIOTECAS REACT

import {
  Button,
  Card,
  Col,
  Image,
  Modal,
  message,
  Row,
  Typography,
  Upload,
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MAX_UPLOAD_FILE } from '@/utils/max-file-upload';
// COMPONENTES
import LoadItem from '../../../../../components/LoadItem';
import { TableTrTrashButton } from '../../../../../components/Table/buttons';
// SERVIÇOS
import {
  GET_API,
  getProfileID,
  getToken,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  UPLOAD_API,
  verifyConfig,
} from '../../../../../services';

interface StationaryBucketGalleryProps extends Omit<PageDefaultProps, 'type'> {
  backTab: () => void;
  nextTab: () => void;
}

const StationaryBucketGallery = ({
  path,
  permission,
  backTab,
  nextTab,
}: StationaryBucketGalleryProps) => {
  // PARAMETROS
  const { ID } = useParams();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState(true);
  const [data, setData] = useState([]);
  const [fileList, setFileList] = useState<any>([]);

  // CARREGA FOTOS CADASTRADAS
  const onLoad = () => {
    setLoad(true);
    GET_API(`/${path}?groupId=${ID}`)
      .then((rs) => rs.json())
      .then((res) => {
        setData(res.data);
        // Modal.warning({ title: "Algo deu errado", content: res.msg });
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
  };

  const onSave = () => {
    setLoad(true);
    POST_API(`/${path}`, {
      urls: JSON.stringify(
        fileList.map((v: any) => ({
          url: v.response.url,
        }))
      ),
      group_id: ID,
    })
      .then((rs) => {
        if (rs.ok) {
          setFileList([]);
          onLoad();
        } else {
          Modal.warning({
            title: 'Algo deu errado',
            content: 'Não foi possível salvar foto',
          });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
  };

  useEffect(() => {
    onLoad();
  }, []);

  if (load) return <LoadItem type="alt" />;

  return (
    <>
      {data.length > 0 ? (
        <Row gutter={[8, 8]}>
          {data.map((v: any, i: any) => (
            <Col key={i} md={6} xs={24}>
              <Card hoverable size="small">
                <Image src={v.url} width={'100%'} />
                <center style={{ marginTop: 8 }}>
                  <TableTrTrashButton
                    action={onLoad}
                    item={v}
                    path={'stationary_bucket_gallery'}
                    permission={'cmb'}
                    type={'list'}
                  />
                </center>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Typography>Nenhuma foto encontrada</Typography>
      )}
      <div style={{ marginTop: '1em' }} />
      {verifyConfig([`${permission}.edit`]) ? (
        <ImgCrop
          modalCancel="Cancelar"
          modalOk="Atualizar"
          modalTitle="Editar imagem"
          rotationSlider
        >
          <Upload
            accept="image/jpg,image/png"
            action={UPLOAD_API}
            beforeUpload={(file) => {
              const isLt5M = file.size / 1024 / 1024 < MAX_UPLOAD_FILE;

              const isValidImage =
                file.type === 'image/jpeg' ||
                file.type === 'image/jpg' ||
                file.type === 'image/png';

              if (!isValidImage) {
                message.error(
                  'Apenas arquivos JPG, JPEG ou PNG são permitidos.'
                );
                return Upload.LIST_IGNORE;
              }

              if (!isLt5M) {
                message.error(
                  'Tamanho do arquivo maior do que o permitido (5MB).'
                );
                return Upload.LIST_IGNORE; // <- não envia
              }
            }}
            className="upload-list-inline"
            fileList={fileList}
            headers={{
              Authorization: `Bearer${getToken()}`,
              Profile: getProfileID(),
            }}
            listType="picture"
            onChange={({ fileList: newFileList }) => {
              setFileList(newFileList);
            }}
          >
            <Button type="primary">Nova foto</Button>
          </Upload>
        </ImgCrop>
      ) : null}
      {fileList.length > 0 ? (
        <Button onClick={onSave} style={{ marginTop: '1em' }} type="primary">
          Enviar
        </Button>
      ) : null}

      <Col span={24}>
        <Button
          htmlType="submit"
          onClick={nextTab}
          style={{ float: 'right', marginLeft: 6 }}
          type="primary"
        >
          Avançar
        </Button>

        <Button onClick={backTab} style={{ float: 'right' }} type="default">
          Voltar
        </Button>
      </Col>
    </>
  );
};

export default StationaryBucketGallery;
