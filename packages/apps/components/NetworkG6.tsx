import { Graph, IG6GraphEvent } from '@antv/g6';
import { useEffect } from 'react';
import { useITranslation } from '../hooks';
import { formalBridges } from '../utils';
import { chainConfigs, crossChainGraph, getChainConfig } from '../utils/network';

const configs = chainConfigs.filter((item) => !!item.tokens.filter((token) => !!token.cross.length).length);

function refreshDraggedNodePosition(event: IG6GraphEvent) {
  const model = event.item?.get('model');
  model.fx = event.x;
  model.fy = event.y;
}

const edges = crossChainGraph
  .map(([from, tos]) => tos.map((to) => [getChainConfig(from), getChainConfig(to)]))
  .flat()
  .filter((item) => item.every((it) => !it.isTest))
  .map(([source, target]) => {
    const value: number = source.tokens.reduce((acc, token) => {
      return acc + token.cross.filter((item) => item.partner.name === target.name).length;
    }, 0);

    return {
      source: source.name,
      target: target.name,
      value,
      size: 0.5,
    };
  });

function NetworkG6() {
  const { t } = useITranslation();

  useEffect(() => {
    const container = document.querySelector('#networks-g6');
    const width = container?.scrollWidth;
    const height = container?.scrollHeight;

    const graph = new Graph({
      container: 'networks-g6',
      width,
      height,
      layout: {
        type: 'force',
        preventOverlap: true,
        // nodeSpacing: 5,
      },
      fitView: true,
      defaultNode: {
        size: 18,
        style: {
          cursor: 'pointer',
        },
      },
      defaultEdge: {
        style: {
          stroke: '#ccc',
          lineAppendWidth: 1,
        },
      },
      nodeStateStyles: {
        highlight: {
          opacity: 1,
        },
        dark: {
          opacity: 0.1,
        },
      },
      edgeStateStyles: {
        highlight: {
          stroke: '#fff',
          lineWidth: 0.5,
        },
        dark: {
          opacity: 0.1,
          lineWidth: 0.5,
        },
      },
    });

    const clearAllStats = () => {
      graph.setAutoPaint(false);
      graph.getNodes().forEach((node) => {
        graph.clearItemStates(node);
      });
      graph.getEdges().forEach((edge) => {
        graph.clearItemStates(edge);
      });
      graph.paint();
      graph.setAutoPaint(true);
    };

    graph.data({
      nodes: configs.map((config) => ({
        id: config.name,
        img: `/image/${config.logos[0].name}`,
        type: 'image',
      })),
      edges,
    });

    graph.render();

    graph.on('node:dragstart', (e) => {
      graph.layout();
      refreshDraggedNodePosition(e);
    });
    graph.on('node:drag', (e) => {
      const forceLayout = graph.get('layoutController').layoutMethods[0];
      forceLayout.execute();
      refreshDraggedNodePosition(e);
    });
    graph.on('node:dragend', (event) => {
      if (event.item) {
        event.item.get('model').fx = null;
        event.item.get('model').fy = null;
      }
    });

    graph.on('node:mouseenter', (event) => {
      const item = event.item;
      graph.setAutoPaint(false);
      graph.getNodes().forEach((node) => {
        graph.clearItemStates(node);
        graph.setItemState(node, 'dark', true);
      });
      graph.setItemState(item!, 'dark', false);
      graph.setItemState(item!, 'highlight', true);

      graph.getEdges().forEach((edge) => {
        if (edge.getSource() === item) {
          graph.setItemState(edge.getTarget(), 'dark', false);
          graph.setItemState(edge.getTarget(), 'highlight', true);
          graph.setItemState(edge, 'highlight', true);
          edge.toFront();
        } else if (edge.getTarget() === item) {
          graph.setItemState(edge.getSource(), 'dark', false);
          graph.setItemState(edge.getSource(), 'highlight', true);
          graph.setItemState(edge, 'highlight', true);
          edge.toFront();
        } else {
          graph.setItemState(edge, 'highlight', false);
          graph.setItemState(edge, 'dark', true);
        }
      });

      graph.on('node:mouseleave', clearAllStats);
      graph.on('canvas:click', clearAllStats);
      graph.paint();
      graph.setAutoPaint(true);
    });

    graph.on('node:click', (evt) => {
      const item = evt.item;
      const model = item?.getModel();
      console.log('🚀 ~ file: NetworkG6.tsx ~ line 156 ~ graph.on ~ item', model?.id);
    });

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line complexity
      window.onresize = () => {
        if (!graph || graph.get('destroyed') || !container || !container.scrollWidth || !container.scrollHeight) {
          return;
        }
        graph.changeSize(container.scrollWidth, container.scrollHeight);
      };
    }

    return () => graph?.destroy();
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-4 lg:mt-6">
      <div
        id="networks-g6"
        className="lg:col-span-8 flex-1 p-4 bg-gray-200 dark:bg-antDark"
        style={{ width: '100%', height: 500 }}
      ></div>

      <div className="lg:col-span-4 bg-gray-200 dark:bg-antDark px-5 py-6">
        <h3 className="uppercase text-xl font-normal">{t('Bridges Statistic')}</h3>

        <div className="flex flex-col gap-2 items-center justify-center m-2 md:m-4">
          <h2 className="text-4xl font-normal">{formalBridges?.length}</h2>
          <span className="text-sm font-normal opacity-50 capitalize">
            {t('Total {{title}}', { title: 'bridges' })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NetworkG6;
