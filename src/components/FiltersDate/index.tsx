import { Col, Row } from 'antd';
import { anos, meses } from '@/utils/data/filters';
import Filter from '../Filter';

interface FiltersDateProps {
  filterMes: { label: string; value: string };
  setFilterMes: (mes: { label: string; value: string }) => void;
  filterAno: { label: number; value: number };
  setFilterAno: (ano: { label: number; value: number }) => void;
}

export default function FiltersDate({
  filterMes,
  setFilterMes,
  filterAno,
  setFilterAno,
}: FiltersDateProps) {
  return (
    <Row gutter={[8, 8]}>
      <Col>
        <Filter
          list={meses}
          name="Mês"
          setState={setFilterMes}
          state={filterMes}
        />
      </Col>
      <Col>
        <Filter
          list={anos}
          name="Ano"
          setState={setFilterAno}
          state={filterAno}
        />
      </Col>
    </Row>
  );
}
