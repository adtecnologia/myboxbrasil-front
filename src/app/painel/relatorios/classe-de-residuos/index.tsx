/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/performance/noNamespaceImport: ignorar */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: ignorar */
import { Button, Col, Row } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import { GiStoneBlock } from 'react-icons/gi';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { Oval } from 'react-loader-spinner';
import CardItem from '@/components/CardItem';
import CardKPISmall from '@/components/CardKPISmall';
import Filter from '@/components/Filter';
import PageDefault from '@/components/PageDefault';
import { cor3, GET_API } from '@/services';
import { anos, labelMonth, meses } from '@/utils/data/filters';

export default function RelatorioClasseDeResiduos() {
  const [data, setData] = useState<any>([]);
  const [totals, setTotals] = useState<any>([]);
  const [scroll, setScroll] = useState<boolean>(false);
  const [labels, setLabels] = useState<any>(null);
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMes, setFilterMes] = useState(meses[new Date().getMonth()]);
  const [filterAno, setFilterAno] = useState({
    label: new Date().getFullYear(),
    value: new Date().getFullYear(),
  });

  const thisGraph = useRef<any>();

  // ref
  const ref = useRef<any>();

  const onScroll = () => {
    setScroll(!scroll);
    ref.current?.scrollTo(scroll ? 0 : 1000, 0);
  };

  useEffect(() => {
    setChart(echarts.init(thisGraph.current));
    const observer = new ResizeObserver((_) => {
      echarts.getInstanceByDom(thisGraph.current).resize();
    });
    observer.observe(thisGraph.current);
  }, []);

  useEffect(() => {
    if (chart && labels) {
      const option: any = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          valueFormatter: (value: any) =>
            `${Number(value).toLocaleString('pt-br')} m³`,
        },
        legend: { data: labels },
        xAxis: {
          type: 'category',
          data: labelMonth,
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: any) =>
              `${Number(value).toLocaleString('pt-br')} m³`,
          },
        },
        grid: {
          left: '0px',
          right: '20px',
          bottom: '20px',
          top: '20px',
          containLabel: true,
        },
        dataZoom: [{ type: 'inside', start: 0, end: '100%' }],
        lineStyle: { color: cor3, width: 2 },
        series: data.map((item: any) => ({
          name: item.name,
          type: 'bar',
          data: item.data,
          label: { show: false },
          emphasis: { focus: 'series' },
        })),
      };

      chart.setOption(option);
    }
  }, [chart, data, labels]);

  useEffect(() => {
    setLoading(true);
    GET_API(
      `/reports/residue-by-month?year=${filterAno.value}&month=${filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => {
        setData(res.series);
        setLabels(res.labels);
        setTotals(res.totals);
      })
      .finally(() => setLoading(false));
  }, [filterAno, filterMes]);

  return (
    <PageDefault
      items={[{ title: 'Relatório' }, { title: 'Classes de Resíduos' }]}
      options={
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
      }
      valid={'rpt.cdr'}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Row className="kpi-carousel" gutter={[16, 16]} ref={ref}>
            {totals.map((item: any) => (
              <Col key={item.name} lg={8} md={12} sm={24} xl={4} xs={24}>
                <CardKPISmall
                  icon={<GiStoneBlock className="card-kpi-small-icon" />}
                  title={item.name}
                  value={`${item.total} m³`}
                />
              </Col>
            ))}
          </Row>
          <Button
            className={`kpi-carousel-icon button-${scroll ? 'inactive' : 'active'}`}
            onClick={onScroll}
            shape="circle"
          >
            <IoChevronForward />
          </Button>
          <Button
            className={`kpi-carousel-icon-alt button-${scroll ? 'active' : 'inactive'}`}
            onClick={onScroll}
            shape="circle"
          >
            <IoChevronBack />
          </Button>
        </Col>
        <Col span={24}>
          <CardItem>
            <div ref={thisGraph} style={{ height: 400, overflow: 'hidden' }} />
            {loading && (
              <Row
                align={'middle'}
                className="loading-graph"
                justify={'center'}
                style={{ height: '90%' }}
              >
                <Oval
                  ariaLabel="oval-loading"
                  color="var(--color01)"
                  height="50"
                  secondaryColor="var(--color01)"
                  visible={true}
                  width="50"
                  wrapperClass=""
                  wrapperStyle={{}}
                />
              </Row>
            )}
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
}
