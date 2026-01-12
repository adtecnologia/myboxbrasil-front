import { useState, useEffect } from 'react';
import { Modal, Typography, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { getToken } from 'firebase/messaging';
import { firebaseConfig, messaging } from '@/lib/firebase/firebase';
const { Title, Paragraph } = Typography;

const STORAGE_KEY = '@myboxbrasil:notification';

export const AutorizarNotificacoesPush = () => {
  const [visible, setVisible] = useState(false);

  const handleClose = () => setVisible(false);

  const requestNotificationPermission = async () => {
    await Notification.requestPermission();
    const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });

    // Adicionar a rota correta quando existir
    // POST_API('/', token)
    //   .then((rs) => console.log('Token enviado com sucesso:', rs))
    //   .catch(POST_CATCH)
  };

  useEffect(() => {
    if ('Notification' in window) {
      const savedDate = localStorage.getItem(STORAGE_KEY);
      const diffInDays = savedDate 
        ? Math.floor((new Date().getTime() - new Date(savedDate).getTime()) / (1000 * 60 * 60 * 24)) 
        : null;

      if (Notification.permission === 'default' && (diffInDays === null || diffInDays >= 30)) {
        setVisible(true);
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        requestNotificationPermission();
      }
    }
  }, []);

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      centered
      width={500}
    >
      <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, color: '#1890ff' }}>
          <BellOutlined />
        </div>

        <div>
          <Title level={3}>Ative as Notificações</Title>
          <Paragraph>
            Receba alertas importantes sobre pedidos, atualizações e mensagens do sistema
            diretamente no seu dispositivo.
          </Paragraph>
        </div>
      </Space>
    </Modal>
  );
};

export default AutorizarNotificacoesPush;
