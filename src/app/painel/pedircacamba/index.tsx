/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: ignorar */
import { Button, Col, Row, Typography } from "antd";
import { useState } from "react";
import PageDefault from "../../../components/PageDefault";
import "./style.css";
import CardItem from "@/components/CardItem";
import { verifyConfig } from "../../../services";
// Steps
import StepAddress from "./steps/StepAddress";
import StepArea from "./steps/StepArea";
import StepEquipmentType from "./steps/StepEquipmentType";
import StepModel from "./steps/StepModel";
import StepProduct from "./steps/StepProduct";
import StepProvider from "./steps/StepProvider";
import StepResidue from "./steps/StepResidue";

const PlaceOrder = () => {
  const [step, setStep] = useState<number>(1);

  const [hasSeller, setHasSeller] = useState<boolean>(false);

  const [address, setAddress] = useState<any>(null);
  const [typeSelect, setTypeSelect] = useState<any>(null);
  const [typeProdSelect, setTypeProdSelect] = useState<any>(null);
  const [modelSelect, setModelSelect] = useState<any>(null);
  const [providerSelect, setProviderSelect] = useState<any>(null);
  const [residueSelect, setResidueSelect] = useState<any[]>([]);

  return (
    <PageDefault
      items={[{ title: "Pedir Locação" }]}
      valid={verifyConfig(["pdd.add"])}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <Row gutter={[16, 16]}>
            {/* Step 1: Endereço */}
            {step >= 1 && (
              <Col className="animation-fade" span={24}>
                <StepAddress
                  onContinue={() => setStep(2)}
                  {...{ setAddress, address, step, setHasSeller }}
                />
              </Col>
            )}

            {/* Sem locadores */}
            {!hasSeller && step >= 2 && (
              <Col className="animation-fade" span={24}>
                <CardItem>
                  <Typography style={{ fontSize: 18, textAlign: "center" }}>
                    Infelizmente não encontramos nenhum locador que atue na sua
                    região.
                  </Typography>
                  <Row gutter={8} justify="center" style={{ marginTop: 18 }}>
                    <Col>
                      <Button onClick={() => setStep(1)} type="default">
                        Escolher outro endereço
                      </Button>
                    </Col>
                  </Row>
                </CardItem>
              </Col>
            )}

            {hasSeller && (
              <>
                {/* Step 2: Tipo de Equipamento */}
                {step >= 2 && (
                  <Col className="animation-fade" span={24}>
                    <StepEquipmentType
                      onBack={() => setStep(1)}
                      onContinue={() =>
                        typeProdSelect.id === 0 ? setStep(3) : setStep(6)
                      }
                      {...{
                        setTypeProdSelect,
                        typeProdSelect,
                        step,
                      }}
                    />
                  </Col>
                )}

                {/* Step 3: Área (apenas para caçamba) */}
                {step >= 3 && typeProdSelect.id === 0 && (
                  <Col className="animation-fade" span={24}>
                    <StepArea
                      onBack={() => setStep(2)}
                      onContinue={() => setStep(4)}
                      {...{ typeSelect, setTypeSelect, step }}
                    />
                  </Col>
                )}

                {/* Step 4: Tipo de resíduo (apenas para caçamba) */}
                {step >= 4 && typeProdSelect.id === 0 && (
                  <Col className="animation-fade" span={24}>
                    <StepResidue
                      onBack={() => setStep(3)}
                      onContinue={() => setStep(5)}
                      {...{
                        residueSelect,
                        setResidueSelect,
                        step,
                        typeSelect,
                      }}
                    />
                  </Col>
                )}

                {/* Step 5: Modelo (apenas para caçamba) */}
                {step >= 5 && typeProdSelect.id === 0 && (
                  <Col className="animation-fade" span={24}>
                    <StepModel
                      onBack={() => setStep(4)}
                      onContinue={() => setStep(6)}
                      {...{
                        step,
                        modelSelect,
                        setModelSelect,
                        typeSelect,
                        residueSelect,
                      }}
                    />
                  </Col>
                )}

                {/* Step 6: Locador */}
                {step >= 6 && (
                  <Col className="animation-fade" span={24}>
                    <StepProvider
                      {...{
                        step,
                        providerSelect,
                        setProviderSelect,
                        typeProdSelect,
                        modelSelect,
                        typeSelect,
                        residueSelect,
                      }}
                      onBack={() =>
                        typeProdSelect.id === 0 ? setStep(5) : setStep(2)
                      }
                      onContinue={() => setStep(7)}
                    />
                  </Col>
                )}

                {/* Step 7: Produto */}
                {step >= 7 && (
                  <Col className="animation-fade" span={24}>
                    <StepProduct
                      {...{
                        step,
                        providerSelect,
                        setProviderSelect,
                        typeProdSelect,
                        modelSelect,
                        typeSelect,
                        residueSelect,
                      }}
                      onBack={() => setStep(6)}
                    />
                  </Col>
                )}
              </>
            )}
          </Row>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default PlaceOrder;
