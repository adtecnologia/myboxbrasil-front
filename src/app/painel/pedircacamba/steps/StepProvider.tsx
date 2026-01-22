import { Button, Col, Input, Modal, Row } from "antd";
import { useEffect, useState } from "react";
import { FiTruck } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import CardItem from "@/components/CardItem";
import CardLocador from "@/components/CardLocador";
import LoadItem from "@/components/LoadItem";
import { GET_API } from "@/services";

interface StepProviderProps {
  step: number;
  typeSelect: string | null;
  modelSelect: any;
  residueSelect: any[];
  providerSelect: any;
  setProviderSelect: (provider: any) => void;
  typeProdSelect: any;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepProvider({
  step,
  providerSelect,
  typeSelect,
  modelSelect,
  residueSelect,
  setProviderSelect,
  typeProdSelect,
  onContinue,
  onBack,
}: StepProviderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [providers, setProviders] = useState<any[]>([]);

  const loadProviders = () => {
    const params = `equipment_id=${typeProdSelect.id}&type_local=${typeSelect ?? ""}&stationary_bucket_type_id=${modelSelect?.id ?? ""}&residue_ids=${residueSelect.map((r) => r.id).join(",")}`;
    GET_API(`/pedir-locacao/cidade/locatarios?${params}`).then((rs) => {
      if (rs.ok) {
        rs.json().then((res) => {
          setProviders(res.data);
        });
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
      setLoading(false);
    });
  };

  const filteredProviders = providers.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadProviders();
  }, []);

  return (
    <CardItem
      title={
        <span
          className="title-card"
          style={{ justifyContent: step === 6 ? "center" : "flex-start" }}
        >
          <FiTruck style={{ marginRight: 8, minWidth: 14 }} />
          De qual locador quer alugar?
        </span>
      }
    >
      {step === 6 && (
        <>
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Col lg={24} md={24} sm={24} xs={24}>
              <Input
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar locadores..."
                prefix={<MdSearch />}
                size="large"
                value={searchTerm}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="start">
            {loading && (
              <Col span={24}>
                <LoadItem title="Carregando locadores" type="alt" />
              </Col>
            )}
            {!loading &&
              filteredProviders.length > 0 &&
              filteredProviders.map((v: any) => (
                <Col key={v.id} md={8} xs={24}>
                  <CardLocador
                    item={v}
                    providerSelect={providerSelect}
                    setProviderSelect={setProviderSelect}
                  />
                </Col>
              ))}

            {!loading && filteredProviders.length === 0 && (
              <Col span={24}>Nenhum locador encontrado.</Col>
            )}
          </Row>
          <Row gutter={[8, 8]} justify="center" style={{ marginTop: 18 }}>
            <Col>
              <Button onClick={onBack} type="default">
                Voltar
              </Button>
            </Col>
            <Col>
              <Button
                disabled={!providerSelect}
                onClick={onContinue}
                type="primary"
              >
                Buscar {typeProdSelect.id === 0 ? "caçambas" : "equipamentos"}{" "}
                desse locador
              </Button>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  setProviderSelect(null);
                  onContinue();
                }}
                type="default"
              >
                Buscar {typeProdSelect.id === 0 ? "caçambas" : "equipamentos"}{" "}
                de todos os locadores
              </Button>
            </Col>
          </Row>
        </>
      )}
    </CardItem>
  );
}
