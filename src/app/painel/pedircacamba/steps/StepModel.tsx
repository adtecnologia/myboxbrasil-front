/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Button, Col, Input, Modal, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { FiBox } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import CardItem from "@/components/CardItem";
import LoadItem from "@/components/LoadItem";
import { GET_API } from "@/services";

interface StepModelProps {
  typeSelect: string | null;
  residueSelect: any[];
  modelSelect: any;
  step: number;
  setModelSelect: (model: any) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepModel({
  modelSelect,
  typeSelect,
  residueSelect,
  step,
  setModelSelect,
  onContinue,
  onBack,
}: StepModelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadModels = () => {
    GET_API(
      `/pedir-locacao/cidade/tipos-cacambas?typeLocal=${typeSelect}&residueIds=${residueSelect
        .map((r) => r.id)
        .join(",")}`
    ).then((rs) => {
      if (rs.ok) {
        rs.json().then((res) => {
          setModels(res.data);
        });
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
    });
    setLoading(false);
  };

  const filteredModels = models.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <CardItem
      title={
        <span
          className="title-card"
          style={{ justifyContent: step === 5 ? "center" : "flex-start" }}
        >
          <FiBox style={{ marginRight: 8, minWidth: 14 }} />
          {step === 5
            ? "Qual o modelo da caçamba que deseja?"
            : modelSelect?.name}
        </span>
      }
    >
      {step === 5 && (
        <>
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Col lg={24} md={24} sm={24} xs={24}>
              <Input
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar modelo de caçamba..."
                prefix={<MdSearch />}
                size="large"
                value={searchTerm}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="center">
            {loading && (
              <Col span={24}>
                <LoadItem title="Carregando modelos de caçambas" type="alt" />
              </Col>
            )}
            {!loading &&
              filteredModels.length > 0 &&
              filteredModels.map((model: any) => (
                <Col key={model.id} lg={6} md={8} sm={12} xl={6} xs={12}>
                  <div
                    className={`pd-painel ${modelSelect?.id === model.id ? "active" : ""}`}
                    onClick={() => setModelSelect(model)}
                    style={{
                      backgroundImage: `url(${model.photo})`,
                    }}
                  >
                    <div className="pd-painel-pele" />
                    <Typography
                      className="pd-painel-texto"
                      style={{ fontSize: 20 }}
                    >
                      {model.name}
                    </Typography>
                  </div>
                </Col>
              ))}
            {!loading && filteredModels.length === 0 && (
              <Col span={24}>Nenhum modelo de caçamba encontrado.</Col>
            )}
          </Row>
          <Row gutter={8} justify="center" style={{ marginTop: 18 }}>
            <Col>
              <Button onClick={onBack} type="default">
                Voltar
              </Button>
            </Col>
            <Col>
              <Button
                disabled={!modelSelect}
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
