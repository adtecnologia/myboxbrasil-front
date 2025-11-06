/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { Col, Form, Modal, Row, Select, Typography } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// css
import './style.css';
// services
import {
  GET_API,
  getToken,
  POST_CATCH,
  setConfig,
  setProfile,
} from '../../services';

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/mybox-gestao-inteligente-de-cacambas.png`;

const ProfileModal: React.FC = () => {
  // router
  const navigate = useNavigate();

  // states
  const [profiles, setProfiles] = useState<any[]>([{ id: 1, type: '' }]);

  // form
  const [form] = Form.useForm();

  // roda quando carrega o componente
  useEffect(() => {
    // verifica usuário logado
    if (getToken() != null) {
      GET_API('/me')
        .then((rs) => {
          if (rs.ok) {
            return rs.json();
          }
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        })
        .then((res) => {
          const profilesList = res.data.profiles;
          if (res.data.profiles.length === 1) {
            setProfile(JSON.stringify(profilesList[0]));
            setConfig(JSON.stringify(profilesList[0].permissions));
            navigate('/painel');
          }
          setProfiles(profilesList);
        })
        .catch(POST_CATCH);
    } else {
      navigate('/');
    }
  }, [navigate]);

  // salvar
  const onSend = async () => null;

  // selecionar
  const handleProfileSelect = () => null;

  return (
    <Row className="content-login">
      <Col className="col-login" lg={9} md={10} sm={24} xl={8} xs={24}>
        {/** biome-ignore lint/performance/noImgElement: ignorar */}
        <img alt="logo-mybox" className="card-logo" src={logo} />
        <div className="card-login">
          <Row>
            <Form form={form} onFinish={onSend} style={{ width: '100%' }}>
              <Typography className="card-title-profile">
                Selecionar perfil
              </Typography>
              <Form.Item name="profile">
                <Select onChange={handleProfileSelect}>
                  {profiles.map((profile: any) => (
                    <Select.Option key={profile.id}>
                      {profile.type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Row>
        </div>
      </Col>
    </Row>
  );
};

export default ProfileModal;
