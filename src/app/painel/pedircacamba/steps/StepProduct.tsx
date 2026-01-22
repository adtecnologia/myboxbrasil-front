import { Button, Col, Modal, Row } from "antd";
import { useEffect, useState } from "react";
import { FiTruck } from "react-icons/fi";
import CardCacamba from "@/components/CardCacamba";
import CardEquipamento from "@/components/CardEquipamento";
import CardItem from "@/components/CardItem";
import LoadItem from "@/components/LoadItem";
import { GET_API } from "@/services";

interface StepProductProps {
  step: number;
  typeSelect: string | null;
  modelSelect: any;
  residueSelect: any[];
  providerSelect: any;
  typeProdSelect: any;
  onBack: () => void;
}

export default function StepProduct({
  providerSelect,
  typeSelect,
  modelSelect,
  residueSelect,
  typeProdSelect,
  onBack,
}: StepProductProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [stationaries, setStationaries] = useState<any[]>([]);

  const loadStationaries = () => {
    const params = `provider_id=${providerSelect?.id ?? ""}&equipment_id=${typeProdSelect.id}&type_local=${typeSelect ?? ""}&stationary_bucket_type_id=${modelSelect?.id ?? ""}&residue_ids=${residueSelect.map((r) => r.id).join(",")}`;
    GET_API(`/pedir-locacao/cidade/equipamentos?${params}`).then((rs) => {
      if (rs.ok) {
        rs.json().then((res) => {
          setStationaries(res.data);
        });
      } else {
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStationaries();
  }, []);

  return (
    <CardItem
      title={
        <span className="title-card">
          <FiTruck style={{ marginRight: 8, minWidth: 14 }} />
          Agora, escolha{" "}
          {typeProdSelect.id === 0 ? "uma caçamba" : "um equipamento"}!
        </span>
      }
    >
      <Row gutter={[16, 16]} justify="start">
        {loading && (
          <Col span={24}>
            <LoadItem title="Carregando locadores" type="alt" />
          </Col>
        )}
        {!loading &&
          stationaries.length > 0 &&
          stationaries.map((item: any) => (
            <Col key={item.id} md={12} xs={24}>
              {typeProdSelect.id === 0 ? (
                <CardCacamba
                  type="shop"
                  {...{ typeSelect, residueSelect, item }}
                />
              ) : (
                <CardEquipamento type="shop" {...{ item }} />
              )}
            </Col>
          ))}

        {!loading && stationaries.length === 0 && (
          <Col span={24}>Nenhuma caçamba encontrada.</Col>
        )}
      </Row>
      <Row gutter={8} justify="center" style={{ marginTop: 18 }}>
        <Col>
          <Button onClick={onBack} type="default">
            Voltar
          </Button>
        </Col>
      </Row>
    </CardItem>
  );
}
