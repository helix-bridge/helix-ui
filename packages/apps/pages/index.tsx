import { GithubOutlined, GlobalOutlined, TwitterOutlined } from '@ant-design/icons';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';
import { Logo } from 'shared/components/widget/Logo';
import { BridgeCategory, ChainConfig, Social } from 'shared/model';
import { useITranslation } from '../hooks';
import { bridgeCategoryDisplay } from '../utils/bridge/bridge';
import { chainConfigs } from '../utils/network';

interface Bridge {
  category: BridgeCategory;
  social: Social;
  supportChains: ChainConfig[];
  description: {
    security: string;
    tech: string;
    developer: string;
  };
}

const NetworkGraph = dynamic(() => import('../components/NetworkG6'), { ssr: false });

const h3Style: CSSProperties = {
  fontFamily: 'IBM Plex Sans',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: 50,
  textAlign: 'right',
  textTransform: 'capitalize',
  margin: 0,
  lineHeight: 1.3,
};

const pStyle: CSSProperties = {
  fontFamily: 'IBM Plex Sans',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: 24,
  textAlign: 'right',
  opacity: 0.7,
  margin: 0,
  lineHeight: 1.3,
};

const getSupportChains = (category: BridgeCategory) =>
  chainConfigs.filter((config) =>
    config.tokens
      .map((token) => token.cross)
      .flat()
      .find((item) => item.category === category)
  );
const bridges: Bridge[] = [
  {
    category: 'helix',
    social: {
      portal: 'https://helixbridge.app/',
      github: 'https://github.com/helix-bridge',
      twitter: 'https://twitter.com/helixbridges',
    },
    supportChains: getSupportChains('helix'),
    description: {
      security: 'Trust-less',
      tech: 'Light Client & Relays',
      developer: 'Helix',
    },
  },
  {
    category: 'cBridge',
    social: {
      portal: 'https://cbridge.celer.network/',
      github: 'https://github.com/celer-network',
      twitter: 'https://twitter.com/CelerNetwork',
    },
    supportChains: getSupportChains('cBridge'),
    description: {
      security: 'Trust-less',
      tech: 'Liquidity Networks',
      developer: 'Celer',
    },
  },
  {
    category: 'XCM',
    social: {
      portal: 'https://polkadot.js.org/',
      github: 'https://github.com/polkadot-js',
      twitter: 'https://twitter.com/polkadot',
    },
    supportChains: getSupportChains('XCM'),
    description: {
      security: 'Trust-less',
      tech: 'Light Client & Relays',
      developer: 'Polkadot',
    },
  },
];

function Page() {
  const { t } = useITranslation();

  return (
    <div>
      <div className="2xl:mb-24 lg:mb-8">
        <h3 style={h3Style}>Helix</h3>
        <h3 style={h3Style}>{t('Aggregator of')}</h3>
        <h3 style={h3Style}>{t('strictly selected bridges')}</h3>

        <p style={pStyle}>{t('Providing a secure and convenient interface for cross-chain asset transfer')}</p>
      </div>

      <h2 className="text-4xl font-bold">{t('Supported Chains')}</h2>

      <div className="gap-4 lg:gap-6">
        <NetworkGraph />
      </div>

      <h2 className="text-4xl font-bold mt-16 mb-8">{t('Aggregated Bridges')}</h2>

      <div className={`grid grid-cols-3 gap-8`}>
        {bridges.map((bridge) => (
          <div key={bridge.category} className="bg-antDark p-8">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/image/bridges/${bridge.category.toLowerCase()}-bridge.png`} className={`w-8 md:w-12`} />
              <div>
                <h4 className="text-xl">{bridgeCategoryDisplay(bridge.category)}</h4>
                <div className="flex items-center gap-2">
                  <a
                    href={bridge.social.portal}
                    target="_blank"
                    rel="noreferrer"
                    className="flex text-gray-400 hover:text-gray-200"
                  >
                    <GlobalOutlined style={{ fontSize: '1.25rem' }} />
                  </a>

                  <a
                    href={bridge.social.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex text-gray-400 hover:text-gray-200"
                  >
                    <GithubOutlined style={{ fontSize: '1.25rem' }} />
                  </a>

                  <a
                    href={bridge.social.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex text-gray-400 hover:text-gray-200"
                  >
                    <TwitterOutlined style={{ fontSize: '1.25rem' }} />
                  </a>
                </div>
              </div>
            </div>

            <hr className="opacity-20 my-4" />

            <div className="flex flex-nowrap items-center gap-2 mb-4 no-scrollbar">
              {bridge.supportChains.map((chain) => (
                <Logo name={chain.logos[0].name} width={24} height={24} key={chain.name} />
              ))}
            </div>

            <div className="flex flex-col gap-px text-gray-400">
              <span>{`Security: ${bridge.description.security}`}</span>
              <span>{`Technology: ${bridge.description.tech}`}</span>
              <span>{`Bridge Developer: ${bridge.description.developer}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps = async ({ locale, res }: GetServerSidePropsContext) => {
  const translations = await serverSideTranslations(locale ?? 'en', ['common']);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=100');

  return {
    props: {
      ...translations,
    },
  };
};

export default Page;
