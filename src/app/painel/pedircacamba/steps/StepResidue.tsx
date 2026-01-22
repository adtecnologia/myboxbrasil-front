/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Button, Col, Input, Modal, Popover, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import CardItem from "@/components/CardItem";
import LoadItem from "@/components/LoadItem";
import { GET_API } from "@/services";

interface StepResidueProps {
  residueSelect: any[];
  typeSelect: string | null;
  setResidueSelect: (type: any[]) => void;
  onContinue: () => void;
  onBack: () => void;
  step: number;
}

export default function StepResidue({
  residueSelect,
  setResidueSelect,
  onContinue,
  onBack,
  step,
  typeSelect,
}: StepResidueProps) {
  const [residues, setResidues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [residueBlockOthers, setResidueBlockOthers] = useState<boolean>(false);
  const [residueBlockD, setResidueBlockD] = useState<boolean>(false);
  const [residueBlockC, setResidueBlockC] = useState<boolean>(false);

  const onVerifyResidue = () => {
    setResidueBlockC(
      residueSelect.some((r) =>
        [
          "Classe A1",
          "Classe A2",
          "Classe A3",
          "Classe B",
          "Classe D",
        ].includes(r.name)
      )
    );
    setResidueBlockD(
      residueSelect.some((r) =>
        [
          "Classe A1",
          "Classe A2",
          "Classe A3",
          "Classe B",
          "Classe C",
        ].includes(r.name)
      )
    );
    setResidueBlockOthers(
      residueSelect.some((r) => ["Classe C", "Classe D"].includes(r.name))
    );
  };

  const loadResidues = () => {
    GET_API(`/pedir-locacao/cidade/residuos?typeLocal=${typeSelect}`).then(
      (rs) => {
        if (rs.ok) {
          rs.json().then((res) => {
            setResidues(res.data);
          });
        } else {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadResidues();
  }, []);

  useEffect(() => {
    onVerifyResidue();
  }, [residueSelect]);

  const filteredResidues = residues.filter((residue) =>
    residue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleResidue = (residue: any) => {
    if (!residue.has_provider) {
      Modal.info({
        title: `Ainda não existem fornecedores que atuam com o resíduo ${String(residue.label).toLowerCase()} na sua ${typeSelect === "I" ? "área interna" : "área externa"}.`,
        okText: "Ok",
      });
      return;
    }

    // Verificar bloqueios
    const isC = residue.name === "Classe C";
    const isD = residue.name === "Classe D";
    const isBlocked =
      (isC && residueBlockC) ||
      (isD && residueBlockD) ||
      (!(isC || isD) && residueBlockOthers);

    if (isBlocked) {
      return;
    }

    const isSelected = residueSelect.includes(residue);
    if (isSelected) {
      setResidueSelect(residueSelect.filter((r) => r.id !== residue.id));
    } else {
      setResidueSelect([...residueSelect, residue]);
    }
  };

  return (
    <CardItem
      title={
        <span
          className="title-card"
          style={{ justifyContent: step === 4 ? "center" : "flex-start" }}
        >
          <FiTrash2 style={{ marginRight: 8, minWidth: 14 }} />
          {step === 4
            ? "Quais tipos de resíduos serão despejados na caçamba?"
            : residueSelect.map((residue) => residue.name).join(", ")}
        </span>
      }
    >
      {step === 4 && (
        <>
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Col lg={24} md={24} sm={24} xs={24}>
              <Input
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar resíduo..."
                prefix={<MdSearch />}
                size="large"
                value={searchTerm}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            {loading && (
              <Col span={24}>
                <LoadItem title="Carregando tipos de resíduos" type="alt" />
              </Col>
            )}
            {!loading &&
              filteredResidues.map((residue) => {
                const isBlocked =
                  (residue.name === "Classe C" && residueBlockC) ||
                  (residue.name === "Classe D" && residueBlockD) ||
                  (!["Classe C", "Classe D"].includes(residue.name) &&
                    residueBlockOthers);

                return (
                  <Col key={residue.id} md={8} xs={24}>
                    <div
                      className={`pd-painel ${residueSelect.includes(residue) ? "active" : ""} ${isBlocked ? "disabled" : ""}`}
                      onClick={() => handleToggleResidue(residue)}
                    >
                      <div className="pd-painel-pele" />
                      <Typography className="pd-painel-texto">
                        {residue.name}
                      </Typography>
                      <Popover
                        content={residue.description}
                        title="Mais informações"
                      >
                        <Button
                          shape="circle"
                          style={{ position: "absolute", top: 10, right: 20 }}
                        >
                          ?
                        </Button>
                      </Popover>
                    </div>
                  </Col>
                );
              })}
            {!loading && filteredResidues.length === 0 && (
              <Col span={24}>Nenhum resíduo encontrado.</Col>
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
                disabled={!residueSelect}
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
