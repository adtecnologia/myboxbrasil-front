import { Col, Row } from 'antd';

import { useState } from 'react';
import CardItem from '@/components/CardItem';
import FiltersDate from '@/components/FiltersDate';
import PageDefault from '@/components/PageDefault';
import { meses } from '@/utils/data/filters';
import RelatorioLocacoesGraph from './_graph';
import RelatorioLocacoesTable from './_table';

export default function RelatorioLocacoes() {
  const [filterMes, setFilterMes] = useState(meses[new Date().getMonth()]);
  const [filterAno, setFilterAno] = useState({
    label: new Date().getFullYear(),
    value: new Date().getFullYear(),
  });

  return (
    <PageDefault
      items={[{ title: 'Relatório' }, { title: 'Locações' }]}
      options={
        <FiltersDate
          {...{ filterAno, setFilterAno, filterMes, setFilterMes }}
        />
      }
      valid={'rpt.lac'}
    >
      <Row gutter={[16, 16]}>
        <Col lg={8} md={8} sm={24} xl={8} xs={24}>
          <CardItem>
            <RelatorioLocacoesGraph />
          </CardItem>
        </Col>
        <Col lg={16} md={16} sm={24} xl={16} xs={24}>
          <CardItem>
            <RelatorioLocacoesTable />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
}
