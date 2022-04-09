import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import { useRef } from 'react';

export type Statistic = [number, number];

interface BarChartProps {
  data: Statistic[]; // [timestamp<million seconds>, value];
  name: string;
}

export function BarChart({ data, name }: BarChartProps) {
  const charRef = useRef(null);
  const mainColor = '#816eeb';
  const barColor = '#151e33';
  const options = {
    chart: {
      alignTicks: false,
      backgroundColor: {
        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
        stops: [
          [0, barColor],
          [1, barColor],
        ],
      },
    },
    rangeSelector: {
      buttons: [
        {
          type: 'all',
          text: 'ALL',
          title: 'ALL',
        },
        {
          type: 'week',
          count: 1,
          text: '7D',
          title: '7D',
        },
        {
          type: 'month',
          count: 1,
          text: '30D',
          title: '30D',
        },
      ],
      buttonPosition: {
        x: -23,
      },
      labelStyle: {
        display: 'none',
        width: 0,
      },
      buttonTheme: {
        fill: '#000',
        stroke: '#ffffff26',
        'stroke-width': 1,
        style: {
          color: 'white',
        },
        states: {
          hover: {},
          select: {
            fill: mainColor,
            style: {
              color: 'white',
            },
          },
        },
      },
      inputStyle: {
        color: '#9ca3af',
      },
    },
    scrollbar: {
      enabled: false,
    },
    navigator: {
      height: 24,
    },
    title: {
      text: '',
    },
    xAxis: {
      labels: {
        format: '{value:%m-%d}',
      },
    },
    yAxis: {
      visible: false,
    },
    /* eslint-disable no-magic-numbers */
    series: [
      {
        type: 'column',
        name,
        data,
        dataGrouping: {
          units: [
            ['week', [1]],
            ['month', [1, 2, 3, 4, 6]],
          ],
        },
      },
    ],
    credits: {
      enabled: false,
    },
    /* eslint-enable no-magic-numbers */
  };

  return (
    <HighchartsReact
      containerProps={{ className: 'h-48 lg:h-72' }}
      highcharts={Highcharts}
      constructorType="stockChart"
      options={options}
      ref={charRef}
    ></HighchartsReact>
  );
}
