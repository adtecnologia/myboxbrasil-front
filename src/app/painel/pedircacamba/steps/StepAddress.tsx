import { Button, Col, Modal, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import CardItem from "@/components/CardItem";
import DrawerEndereco from "@/components/DrawerEndereco";
import { GET_API, POST_API } from "@/services";

interface StepAddressProps {
  address: any;
  step: number;
  setAddress: (address: any) => void;
  setHasSeller: (hasSeller: boolean) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export default function StepAddress({
  address,
  step,
  onContinue,
  setAddress,
  setHasSeller,
}: StepAddressProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const loadAddress = () => {
    GET_API("/address?active=1")
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length > 0) {
          setAddress(res.data[0]);
        }
      });
  };

  const onSetAddress = (value: any) => {
    POST_API("/address", { active: 1 }, value?.id).then((rs) => {
      if (rs.ok) {
        setAddress(value);
        setOpen(false);
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    GET_API("/pedir-locacao/cidade").then((rs) => {
      if (rs.ok) {
        rs.json().then((value) => {
          setHasSeller(value.has);
        });
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
      setLoading(false);
    });
  }, [address]);

  useEffect(() => {
    loadAddress();
  }, []);

  return (
    <CardItem
      title={
        <span
          className="title-card"
          style={{
            justifyContent: step === 1 ? "center" : "flex-start",
          }}
        >
          <FiMapPin style={{ marginRight: 8, minWidth: 14 }} />{" "}
          {step === 1
            ? "Qual o endereço para locação?"
            : `${address?.street}, ${address?.number} - ${address?.district} - ${address?.city.name} / ${address?.city.state.acronym}`}
        </span>
      }
    >
      {step === 1 && (
        <>
          {address === null ? (
            <Typography style={{ textAlign: "center" }}>
              Nenhum endereço selecionado
            </Typography>
          ) : (
            <Typography style={{ textAlign: "center" }}>
              {address?.street}, {address?.number} - {address?.district} -{" "}
              {address?.city.name} / {address?.city.state.acronym}
            </Typography>
          )}
          <Row gutter={8} justify="center" style={{ marginTop: 18 }}>
            <Col>
              <Button onClick={() => setOpen(true)} type="default">
                Selecionar endereço
              </Button>
            </Col>
            <Col>
              <Button
                disabled={!address}
                loading={loading}
                onClick={onContinue}
                type="primary"
              >
                Continuar
              </Button>
            </Col>
          </Row>
          <DrawerEndereco
            {...{ address, open }}
            close={() => setOpen(false)}
            disabledClose={address === null}
            setAddress={onSetAddress}
          />
        </>
      )}
    </CardItem>
  );
}
