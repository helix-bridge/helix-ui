import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import { useRef } from 'react';
import { THEME } from 'shared/config/theme';
import { readStorage } from 'shared/utils/helper';
import HighchartsExporting from 'highcharts/modules/exporting';

export type Statistic = [number, number];

interface BarChartProps {
  data: Statistic[]; // [timestamp<million seconds>, value];
  name: string;
}

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts);
}

export function BarChart({ data, name }: BarChartProps) {
  const charRef = useRef(null);
  const isDark = !readStorage().theme || readStorage().theme === THEME.DARK;
  const mainColor = '#00B2FF';
  const barColor = isDark ? '#151d35' : 'rgb(229,231,235)';

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
        fill: isDark ? 'none' : '#ccc',
        stroke: mainColor,
        'stroke-width': 1,
        style: {
          color: 'white',
        },
        states: {
          hover: {
            fill: mainColor,
          },
          select: {
            fill: mainColor,
            style: {
              color: 'white',
            },
          },
        },
      },
      inputStyle: {
        display: 'none',
        width: 0,
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
    series: [{ type: 'column', name, data }],
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
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
