// react libraries
import { useEffect, useState } from "react";
import { Button, message, Modal, Tag, Typography, Upload } from "antd";
import { fromAddress } from "react-geocode";

// services
import { GET_API, getProfileID, getToken, getUPLOADAPI, POST_API, POST_CATCH, verifyConfig } from "../../../services";

// components
import CardItem from "../../../components/CardItem";
import { Link } from "react-router-dom";


const EnvironmentalLicense = () => {
  
  // state
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [loadButton, setLoadButton] = useState<any>(false);
  const [id, setId] = useState<any>(null);
  const [cityName, setCityName] = useState<any>("");
  const [stateAcronym, setStateAcronym] = useState<any>("");

  // function save
  const onSend = (values: any) => {

    const address = `${values?.street}, ${values?.number} - ${values?.district} - ${cityName} / ${stateAcronym}`;
    setLoadButton(true);
    fromAddress(address).then(({ results }) => {

      const { lat, lng } = results[0].geometry.location;

      values.latitude = lat;
      values.longitude = lng;

      POST_API(`/address`, values, id).then((rs) => {
        if (rs.ok) return rs.json();
        else Modal.warning({title: "Algo deu errado", content: rs.statusText, });
      }).then(() => {
        setOpen(false);
      }).catch(POST_CATCH).finally(() => setLoadButton(false));

    }).catch(() => Modal.warning({ title: "Algo deu errado", content: "Não foi possível encontrar endereço" }));

  };

  const onChangePic = (value: any) => {
    if (value.file.response?.url) {
      message.loading({content: 'Atualizando licença ambiental', key:'picture'})
      POST_API(`/me`, { environmental_license: value.file.response?.url }).then((rs) => {
        if (rs.ok) {
          onView()
          message.success({ content: 'Licença atualizada', key:'picture' });
        } else message.success({ content: 'Algo deu errado', key:'picture' });
      }).catch(POST_CATCH);
    }
  };

  const onView = () => {
    GET_API(`/me`).then((rs) => {
      if (rs.ok) return rs.json();
      else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
    }).then((res) => {
      setData(res.data);
    }).catch(POST_CATCH);
  }

  useEffect(() => {
    onView()
  }, [])

  return (
    <CardItem title="Licença ambiental" option={ verifyConfig(['conf.lcs.edit']) ? (
      <Upload
        maxCount={1}
        showUploadList={false}
        accept="application/pdf"
        action={getUPLOADAPI}
        onChange={onChangePic}
        headers={{
          Authorization: "Bearer " + getToken(),
          Profile: getProfileID(),
        }}
      >
      <Button type="primary" className="btn-primary" size="small"  style={{float: 'right'}} onClick={() => setOpen(true)}>Atualizar arquivo</Button> 
      </Upload>
    ) : null}>
      { data?.environmental_license ? <Link to={data.environmental_license} target="_blank">Anexo licença ambiental</Link> : <Typography>Nenhum arquivo anexado</Typography> }<br/>
    </CardItem>
  );
};

export default EnvironmentalLicense;
