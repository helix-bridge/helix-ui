/* eslint-disable no-magic-numbers */
import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import uniq from 'lodash/uniq';
import { useLayoutEffect } from 'react';
import { chainConfigs } from '../utils/network';

const configs = chainConfigs.filter((item) => !!item.tokens.filter((token) => !!token.cross.length).length);

const source = configs.map((item) => {
  return {
    name: item.name,
    linkWith: uniq(item.tokens.map((token) => token.cross.map((cross) => cross.partner.name)).flat()),
    children: item.tokens.map((token) => ({
      name: token.name,
      value: token.cross.length,
      image: `/image/${token.logo}`,
      size: 25,
    })),
    image: `/image/${item.logos[0].name}`,
    size: 55,
  };
});

function NetworkGraph() {
  useLayoutEffect(() => {
    const root = am5.Root.new('networks');

    const data = {
      name: 'Root',
      value: 0,
      children: source,
    };

    // Create wrapper container
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      })
    );

    // https://www.amcharts.com/docs/v5/charts/hierarchy/#Adding
    const series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        initialDepth: 0,
        topDepth: 1,
        minRadius: 10,
        maxRadius: 25,
        valueField: 'value',
        categoryField: 'name',
        childDataField: 'children',
        idField: 'name',
        linkWithStrength: 0.3,
        linkWithField: 'linkWith',
        nodePadding: 60,
        manyBodyStrength: -5,
      })
    );

    root.setThemes([am5themes_Animated.new(root)]);
    root.setThemes([am5themes_Responsive.new(root)]);

    series.circles.template.set('forceHidden', true);
    // series.outerCircles.template.set('forceHidden', true);

    series.nodes.template.setup = (target) => {
      console.log('🚀 ~ file: NetworkGraph.tsx ~ line 68 ~ useLayoutEffect ~ target', target);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target.events.on('dataitemchanged', (event: any) => {
        console.log('🚀 ~ file: NetworkGraph.tsx ~ line 84 ~ target.events.on ~ event', event);

        target.children.push(
          am5.Picture.new(root, {
            width: event?.target?.dataItem?.dataContext?.size,
            height: event?.target?.dataItem?.dataContext?.size,
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            src: event?.target?.dataItem?.dataContext?.image,
          })
        );
      });
    };

    series.labels.template.setAll({
      forceHidden: true,
    });

    series.get('colors')?.set('step', 2);

    series.data.setAll([data]);

    series.set('selectedDataItem', series.dataItems[0]);

    // Make stuff animate on load
    series.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div id="networks" className="bg-gray-200 dark:bg-antDark" style={{ width: '100%', height: 500 }}></div>;
}

export default NetworkGraph;
