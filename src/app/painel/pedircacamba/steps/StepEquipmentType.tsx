import { Button, Col, Input, Modal, Row } from "antd";
import { useEffect, useState } from "react";
import { LiaDumpsterSolid } from "react-icons/lia";
import { MdSearch } from "react-icons/md";
import CardItem from "@/components/CardItem";
import CardType from "@/components/CardType";
import LoadItem from "@/components/LoadItem";
import { GET_API } from "@/services";

interface StepEquipmentTypeProps {
  typeProdSelect: any;
  step: number;
  setTypeProdSelect: (type: any) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepEquipmentType({
  typeProdSelect,
  setTypeProdSelect,
  onContinue,
  onBack,
  step,
}: StepEquipmentTypeProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);

  const loadEquipment = () => {
    GET_API("/pedir-locacao/cidade/tipos-equipamentos").then((rs) => {
      if (rs.ok) {
        rs.json().then((res) => {
          setEquipmentTypes(res.data);
        });
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
      setLoading(false);
    });
  };

  const filteredTypes = equipmentTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadEquipment();
  }, []);

  return (
    <CardItem
      title={
        <span
          className="title-card"
          style={{
            justifyContent: step === 2 ? "center" : "flex-start",
          }}
        >
          <LiaDumpsterSolid
            size={24}
            style={{ marginRight: 8, minWidth: 14 }}
          />
          {step === 2
            ? "Qual tipo de equipamento você deseja locar?"
            : `${typeProdSelect?.name}`}
        </span>
      }
    >
      {step === 2 && (
        <>
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Col lg={24} md={24} sm={24} xs={24}>
              <Input
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar equipamento..."
                prefix={<MdSearch />}
                size="large"
                value={searchTerm}
              />
            </Col>
          </Row>
          <Row align="middle" gutter={[16, 16]} justify="center">
            {loading && (
              <Col span={24}>
                <LoadItem title="Carregando tipo de equipamentos" type="alt" />
              </Col>
            )}
            {!loading &&
              filteredTypes.length > 0 &&
              filteredTypes.map((type) => (
                <Col key={type.id} lg={4} md={6} sm={6} xl={4} xs={12}>
                  <CardType
                    item={{
                      disabled: !type.has_provider,
                      id: type.id,
                      name: type.name,
                      photo: type.photo,
                    }}
                    setTypeProdSelect={setTypeProdSelect}
                    typeProdSelect={typeProdSelect}
                  />
                </Col>
              ))}
            {!loading && filteredTypes.length === 0 && (
              <Col span={24}>Nenhum equipamento encontrado.</Col>
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
                disabled={!typeProdSelect}
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
