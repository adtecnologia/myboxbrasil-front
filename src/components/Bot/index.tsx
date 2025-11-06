import { CloseOutlined } from '@ant-design/icons';
import { Button, Drawer, Image, Input, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { MdOutlineSupportAgent } from 'react-icons/md';
import { TbSend2 } from 'react-icons/tb';
import ReactMarkdown from 'react-markdown';

const BotComponent = () => {
  const [open, setOpen] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [history, setHistory] = useState<
    { type: 'human' | 'ai'; text: string }[]
  >([]);

  const onSend = async () => {
    if (!message) {
      return;
    }
    setHistory([...history, { type: 'human', text: message }]);
    setMessage('');
    setLoading(true);

    const response = await fetch(
      'https://bots.easy-peasy.ai/bot/a805255f-a601-4f0a-bad3-2d0edaa1d389/api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'b22c15a7-e9c4-4a36-aae6-0f236786eb45',
        },
        body: JSON.stringify({
          message,
          history,
          stream: false,
          include_sources: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    setHistory(data.history);
    setLoading(false);
  };

  return (
    <>
      {!open && (
        <Tooltip placement="left" title="Precisa de ajuda?">
          <Button
            onClick={() => setOpen(true)}
            shape="circle"
            size="large"
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 9999,
            }}
            type="primary"
          >
            <MdOutlineSupportAgent size={20} />
          </Button>
        </Tooltip>
      )}
      <Drawer
        className="drawer-chat"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
      >
        <div className="chat-container">
          <div className="header-chat">
            <center>
              <Image
                className="header-image-chat"
                preview={false}
                src={`${import.meta.env.VITE_URL_ASSETS}/chat.jpg`}
              />
            </center>
            <Typography className="header-text-chat">
              Bem-vindo (a) ao colaborador de IA da Plataforma MyBox,
              especializado nas funções e informações referente a utilização da
              Plataforma MyBox. E também tenho informações sobre as legislações
              vigentes de resíduos sólidos no Brasil, principalmente a PNRS
              12,305/2010 3 do Decreto Federal 10.936/2022 que regulamentou a
              PNRS.
            </Typography>
          </div>
          <div className="body-chat">
            <Typography className="chat-item chat-ai">
              Olá, estou aqui para ajudar! O que posso fazer por você hoje?
            </Typography>
            {history.map((item, index) => (
              <div
                className={`chat-item markdown chat-${item.type}`}
                key={`${item.type}-${index}`}
              >
                <ReactMarkdown>{item.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          <div className="footer-chat">
            <Input
              className="footer-input-chat"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && message.trim()) {
                  onSend();
                }
              }}
              placeholder="Digite sua dúvida..."
              readOnly={loading}
              size="large"
              suffix={
                <Button
                  icon={<TbSend2 size={20} />}
                  loading={loading}
                  onClick={onSend}
                  shape="circle"
                  type="text"
                />
              }
              value={message}
            />
          </div>
        </div>
        <Button
          className="close-bnt"
          onClick={() => setOpen(false)}
          shape="circle"
          type="text"
        >
          <CloseOutlined />
        </Button>
      </Drawer>
    </>
  );
};

export default BotComponent;
