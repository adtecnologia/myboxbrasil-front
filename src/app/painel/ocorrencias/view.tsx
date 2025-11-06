/** biome-ignore-all lint/nursery/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */

import { Col, Row, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StatisticComponent from '@/components/StatisticComponent';
// components
import CardItem from '../../../components/CardItem';
import PageDefault from '../../../components/PageDefault';
import { TableReturnButton } from '../../../components/Table/buttons';
// services
import { GET_API, type PageDefaultProps, POST_CATCH } from '../../../services';

const ReportView = ({ permission }: PageDefaultProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();
  const { ID } = useParams();
  // ESTADOS DO COMPONENTE
  const [report, setReport] = useState<any>();

  const onLoad = () => {
    GET_API(`/report/${ID}`)
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data) {
          setReport(res.data);
        } else {
          navigate('..');
        }
      })
      .catch(POST_CATCH);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignorar
  useEffect(() => {
    onLoad();
  }, [ID]);

  return (
    <PageDefault
      items={[
        { title: <Link to={'..'}>Ocorrências</Link> },
        { title: 'Nova ocorrência' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={permission} type={'add'} />
        </Row>
      }
      valid={`${permission}.add`}
    >
      <Row gutter={[16, 16]}>
        {report && (
          <Col md={24} xs={24}>
            <CardItem
              title={`${report.order_location_product.product.code} - Modelo 
                    ${
                      report.order_location_product.product
                        .stationary_bucket_group.stationary_bucket_type.name
                    }`}
            >
              <Row gutter={[8, 8]}>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Situação"
                    value={report.order_location_product.status.name}
                  />
                </Col>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Data locação"
                    value={
                      report.order_location_product.location_date
                        ? report.order_location_product.location_date_format
                        : '-'
                    }
                  />
                </Col>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Data retirada"
                    value={
                      report.order_location_product.withdraw_date
                        ? report.order_location_product.withdraw_date_format
                        : '-'
                    }
                  />
                </Col>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Data análise"
                    value={
                      report.order_location_product.date_analysis
                        ? report.order_location_product.date_analysis_format
                        : '-'
                    }
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Transportador(a)"
                    value={
                      report.order_location_product.driver_location?.name ?? '-'
                    }
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Locador(a)"
                    value={report.order_location_product.provider.name ?? '-'}
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Locatário(a)"
                    value={report.order_location_product.client.name ?? '-'}
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Destinador final"
                    value={
                      report.order_location_product.destination?.name ?? '-'
                    }
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Locação"
                    value={`${report.order_location_product.client_street} ${report.order_location_product.client_number} - ${report.order_location_product.client_district}`}
                  />
                </Col>
                <Col lg={24} md={24} xl={24} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Resíduos"
                    value={`${report.order_location_product.residues.map((item: any) => item.name).join(', ')}`}
                  />
                </Col>
              </Row>
            </CardItem>
          </Col>
        )}
        {report && (
          <Col span={24}>
            <CardItem title={'Ocorrência relatada'}>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Descrição"
                    value={`${report.description}`}
                  />
                </Col>
                <Col span={24}>
                  <StatisticComponent
                    title="Arquivos"
                    value={
                      report.documents.length > 0
                        ? report.documents.map((item: any) => (
                            <Typography
                              key={item.id}
                              style={{
                                textWrap: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                              }}
                            >
                              <Link target="_blank" to={item.url}>
                                {item.url}
                              </Link>
                            </Typography>
                          ))
                        : 'Sem documentos'
                    }
                  />
                </Col>
              </Row>
            </CardItem>
          </Col>
        )}
      </Row>
    </PageDefault>
  );
};

export default ReportView;
