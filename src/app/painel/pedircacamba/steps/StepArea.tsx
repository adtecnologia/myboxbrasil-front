/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Button, Col, Modal, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";
import CardItem from "@/components/CardItem";
import LoadItem from "@/components/LoadItem";
import { GET_API } from "@/services";

interface StepAreaProps {
  typeSelect: string | null;
  setTypeSelect: (type: string) => void;
  onContinue: () => void;
  onBack: () => void;
  step: number;
}

export default function StepArea({
  typeSelect,
  setTypeSelect,
  onContinue,
  onBack,
  step,
}: StepAreaProps) {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAreas = () => {
    GET_API("/pedir-locacao/cidade/areas").then((rs) => {
      if (rs.ok) {
        rs.json().then((res) => {
          setAreas(res.data);
        });
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAreas();
  }, []);

  return (
    <CardItem
      title={
        <span
          className="title-card"
          style={{ justifyContent: step === 3 ? "center" : "flex-start" }}
        >
          <FiHome style={{ marginRight: 8, minWidth: 14 }} />
          {step === 3
            ? "Onde a caçamba será locada?"
            : areas.filter((area) => area.type === typeSelect)[0]?.label || ""}
        </span>
      }
    >
      {step === 3 && (
        <>
          <Row gutter={[16, 16]}>
            {loading && (
              <Col span={24}>
                <LoadItem title="Carregando locais para locação" type="alt" />
              </Col>
            )}
            {!loading &&
              areas.map((area) => (
                <Col key={area.type} md={12} xs={24}>
                  <div
                    className={`pd-painel ${typeSelect === area.type ? "active" : ""}`}
                    onClick={() => {
                      if (!area.has_provider) {
                        Modal.info({
                          title:
                            "Ainda não existem fornecedores que atuam com locação de caçambas para " +
                            String(area.label).toLowerCase() +
                            " na sua região.",
                          okText: "Ok",
                        });
                        return;
                      }

                      setTypeSelect(area.type);
                    }}
                    style={{
                      backgroundImage: `url(${import.meta.env.VITE_URL_ASSETS}/${area.img})`,
                    }}
                  >
                    <div className="pd-painel-pele" />
                    <Typography className="pd-painel-texto">
                      {area.label}
                    </Typography>
                  </div>
                </Col>
              ))}
          </Row>
          <Row gutter={8} justify="center" style={{ marginTop: 18 }}>
            <Col>
              <Button onClick={onBack} type="default">
                Voltar
              </Button>
            </Col>
            <Col>
              <Button
                disabled={!typeSelect}
                onClick={onContinue}
                type="primary"
              >
                Continuar
              </Button>
            </Col>
          </Row>
        </>
      )}
    </CardItem>
  );
}
