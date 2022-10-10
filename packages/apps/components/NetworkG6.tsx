import { Graph, IEdge, IG6GraphEvent, INode, registerEdge, Tooltip } from '@antv/g6';
import { groupBy } from 'lodash';
import { useEffect, useState } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { isTestChain } from 'shared/config/env';
import { CrossOverview, Network, TokenWithBridgesInfo } from 'shared/model';
import { BRIDGES } from '../bridges/bridges';
import { chainConfigs, genCrossChainGraph, getChainConfig, getDisplayName } from '../utils/network';

interface Overview extends CrossOverview {
  source: { name: string; symbol: string; logo: string };
}

registerEdge(
  'circle-running',
  {
    afterDraw(_, group) {
      const shape = group?.get('children')[0];
      const startPoint = shape.getPoint(0);

      const circle = group?.addShape('circle', {
        attrs: {
          x: startPoint.x,
          y: startPoint.y,
          fill: '#1890ff',
          r: 1,
        },
        name: 'circle-shape',
      });

      circle?.animate(
        (ratio: unknown) => {
          const tmpPoint = shape.getPoint(ratio);

          return {
            x: tmpPoint.x,
            y: tmpPoint.y,
          };
        },
        {
          repeat: true,
          duration: 3000,
        }
      );
    },
  },
  'line'
);

const tooltip = new Tooltip({
  offsetX: -50,
  offsetY: 50,
  itemTypes: ['node', 'edge'],
  getContent: (event) => {
    const outDiv = document.createElement('div');
    const model = event?.item?.getModel();
    const type = event?.item?.getType();

    if (type === 'node') {
      outDiv.innerHTML = getDisplayName(model?.id as Network);
    } else if (type === 'edge') {
      const source = (event?.item as IEdge).getSource();
      const target = (event?.item as IEdge).getTarget();
      const from = source.getModel().id as Network;
      const to = target.getModel().id as Network;
      const direction = [from, to].sort().join('');
      const imgGen = (token: TokenWithBridgesInfo) => `<img src="/image/${token.logo}" class="w-4 h-4 rounded-full" />`;

      const genHTML = (network: Network) => {
        const config = getChainConfig(network);

        return `
          <div class="flex flex-col gap-1">
            <b>${getDisplayName(config.name)}</b>
            <div class="flex items-center gap-1">
              <b> Tokens: </b>
              ${config.tokens
                .filter((token) =>
                  token.cross.some((overview) => [overview.partner.name, token.host].sort().join('') === direction)
                )
                .map(imgGen)
                .join('')}
            </div>
          </div>
       `;
      };

      outDiv.innerHTML = [from, to].map(genHTML).join('<div class="bg-gray-300 w-full h-px my-2" ></div>');
    }
    return outDiv;
  },
});

const configs = chainConfigs.filter((item) => !!item.tokens.filter((token) => !!token.cross.length).length);

function refreshDraggedNodePosition(event: IG6GraphEvent) {
  const model = event.item?.get('model');
  model.fx = event.x;
  model.fy = event.y;
}

const nodes = configs.map((config) => ({
  id: config.name,
  img: `/image/${config.logos[0].name}`,
  type: 'image',
}));

const edges = genCrossChainGraph(BRIDGES)
  .map(([from, tos]) => tos.map((to) => [getChainConfig(from), getChainConfig(to)]))
  .flat()
  .filter((item) => item.every((it) => isTestChain === it.isTest))
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
  })
  .filter((item) => item.value);

const getGroupedOverview = (network: Network) => {
  const config = getChainConfig(network);
  const tokens: Overview[] = config.tokens
    .map((token) =>
      token.cross.map((cross) => ({
        ...cross,
        source: { name: token.host, symbol: token.symbol, logo: token.logo },
      }))
    )
    .flat()
    .filter((token) => token.source.name !== token.partner.name);

  return groupBy(tokens, (token) => `${token.source.name}_${token.partner.name}`);
};

const defaultOverview = getGroupedOverview(isTestChain ? 'pangolin' : 'darwinia');

function NetworkG6() {
  const [data, setData] = useState<{ [key: string]: Overview[] }>(defaultOverview);

  useEffect(() => {
    const container = document.querySelector('#networks-g6');
    const spacing = 48;
    const width = container!.scrollWidth - spacing;
    const height = container!.scrollHeight - spacing;

    const graph = new Graph({
      container: 'networks-g6',
      width,
      height,
      plugins: [tooltip],
      modes: {
        default: ['drag-node'],
      },
      layout: {
        begin: [spacing, spacing],
        type: 'force',
        preventOverlap: true,
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
          cursor: 'pointer',
          stroke: '#9ca3af',
          lineAppendWidth: 3,
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
          stroke: '#f9fafb',
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
        graph.updateItem(edge, { type: 'line' });
        graph.clearItemStates(edge);
      });
      graph.paint();
      graph.setAutoPaint(true);
    };

    graph.data({ nodes, edges });

    graph.render();

    graph.on('node:dragstart', (e) => {
      graph.layout();
      refreshDraggedNodePosition(e);
    });

    graph.on('node:drag', (e) => {
      refreshDraggedNodePosition(e);
    });

    graph.on('node:dragend', (event) => {
      const model = event.item?.get('model');
      if (model) {
        model.fx = null;
        model.fy = null;
      }
    });

    graph.on('node:mouseenter', (event) => {
      const item = event.item as INode;
      graph.setAutoPaint(false);
      graph.getNodes().forEach((node) => {
        graph.clearItemStates(node);
        graph.setItemState(node, 'dark', true);
      });

      graph.getEdges().forEach((edge) => {
        const source = edge.getSource();
        const target = edge.getTarget();
        const isNodeEdge = source === item || target === item;

        if (isNodeEdge) {
          [source, target].forEach((node) => {
            graph.setItemState(node, 'dark', false);
            graph.setItemState(node, 'highlight', true);
            graph.setItemState(edge, 'highlight', true);
            graph.updateItem(edge, { type: 'circle-running' });
            edge.toFront();
          });
        } else {
          graph.setItemState(edge, 'highlight', false);
          graph.setItemState(edge, 'dark', true);
        }
      });

      graph.paint();
      graph.setAutoPaint(true);
    });

    graph.on('edge:mouseenter', (evt) => {
      const item = evt.item as IEdge;

      graph.setAutoPaint(false);
      graph.getEdges().forEach((edge) => {
        graph.clearItemStates(edge);
        graph.setItemState(edge, 'dark', true);

        if (edge.getSource() === item.getTarget() && edge.getTarget() === item.getSource()) {
          graph.updateItem(edge!, { type: 'circle-running' });
        }
      });
      graph.setItemState(item!, 'dark', false);
      graph.setItemState(item!, 'highlight', true);
      graph.updateItem(item!, { type: 'circle-running' });

      graph.getNodes().forEach((node) => {
        const isEdgeNode = item.getSource() === node || item.getTarget() === node;

        graph.setItemState(node, 'dark', !isEdgeNode);
        graph.setItemState(node, 'highlight', isEdgeNode);

        if (isEdgeNode) {
          node.toFront();
        }
      });

      graph.paint();
      graph.setAutoPaint(true);
    });

    graph.on('node:mouseleave', clearAllStats);
    graph.on('edge:mouseleave', clearAllStats);
    graph.on('canvas:click', clearAllStats);

    graph.on('node:click', (evt) => {
      const item = evt.item;
      const model = item?.getModel();

      setData(getGroupedOverview(model!.id as Network));
    });

    graph.on('edge:click', (evt) => {
      const item = evt.item as IEdge;
      const node = item.getSource();
      const model = node.getModel();
      const sourceConfig = getChainConfig(model!.id as Network);
      const target = item.getTarget().getModel().id;

      const tokens: Overview[] = sourceConfig.tokens
        .map((token) =>
          token.cross.map((cross) => ({
            ...cross,
            source: { name: token.host, symbol: token.symbol, logo: token.logo },
          }))
        )
        .flat()
        .filter((token) => {
          const from = token.source.name;
          const to = token.partner.name;

          return from !== to && [from, to].sort().join('') === [sourceConfig.name, target].sort().join('');
        });

      setData(groupBy(tokens, (token) => `${token.source.name}_${token.partner.name}`));
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
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 mt-4 lg:mt-6">
      <div
        id="networks-g6"
        className="lg:col-span-9 flex-1 p-6 bg-antDark"
        style={{ width: '100%', height: 500 }}
      ></div>

      <div style={{ height: 500 }} className="lg:col-span-3 bg-antDark px-5 p-6 ">
        <div className="overflow-scroll h-full no-scrollbar">
          {Object.entries(data).map(([group, crosses]) => {
            const [from, to] = group.split('_') as Network[];

            return (
              <div key={group} className="mb-4">
                <h3 className="flex items-center justify-between">
                  <span className="truncate">{getDisplayName(from)}</span>
                  <span className="truncate">{getDisplayName(to)}</span>
                </h3>

                {crosses.map((cross, index) => {
                  const config = getChainConfig(cross.partner.name);
                  const token = config.tokens.find((item) => item.symbol === cross.partner.symbol);

                  return (
                    <div key={cross.bridge + '_' + index} className="grid grid-cols-5 text-xs mb-2">
                      <div className="flex items-center gap-2 col-span-2">
                        <Logo name={cross.source.logo} width={16} height={16} />
                        <span className="truncate">{cross.source.symbol}</span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <div className="bg-gray-500 w-full h-0.5 relative token-transfer after:bg-gray-500 before:bg-gray-500"></div>
                      </div>
                      <div className="flex flex-row-reverse items-center gap-2 col-span-2">
                        <Logo name={token?.logo} width={16} height={16} />
                        <span className="truncate">{token?.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NetworkG6;
