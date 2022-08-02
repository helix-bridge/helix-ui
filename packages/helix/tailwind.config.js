module.exports = {
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: {
        whirl: 'whirl 1s linear',
        'whirl-reverse': 'whirl-reverse 1s linear',
        'ball-scale-pulse': 'ball-scale-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        whirl: {
          '0%': { transform: 'rotateY(0deg)', opacity: 1 },
          '25%': { transform: 'rotateY(90deg)', opacity: 0.3 },
          '50%': { transform: 'rotateY(120deg)', opacity: 0 },
          '75%': { transform: 'rotateY(150deg)', opacity: 0.3 },
          '100%': { transform: 'rotateY(180deg)', opacity: 1 },
        },
        'whirl-reverse': {
          '0%': { transform: 'rotateY(180deg)', opacity: 1 },
          '25%': { transform: 'rotateY(150deg)', opacity: 0.3 },
          '50%': { transform: 'rotateY(120deg)', opacity: 0 },
          '75%': { transform: 'rotateY(90deg)', opacity: 0.3 },
          '100%': { transform: 'rotateY(180deg)', opacity: 1 },
        },
        'ball-scale-pulse': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
      },
      backgroundImage: (_) => ({
        darwinia: 'linear-gradient(-45deg, #fe3876 0%, #7c30dd 71%, #3a30dd 100%)',
      }),
      backgroundColor: (_) => ({
        antDark: '#151e33',
        crab: '#EC3783',
        kusama: '#000',
        pangolin: '#5745DE',
        pangoro: '#5745DE',
        polkadot: '#e6007a',
      }),
      borderRadius: {
        xl: '10px',
        lg: '8px',
        sm: '4px',
        xs: '2px',
      },
      boxShadow: {
        'mock-bottom-border': '0px 10px 1px -8px #5745de',
        'mock-bottom-border-light': '0px 10px 1px -8px rgba(255,255,255,.85)',
      },
      colors: (_) => ({
        crab: {
          main: '#EC3783',
        },
        darwinia: {
          main: '#3a30dd',
        },
        kusama: {
          main: '#000',
        },
        pangolin: {
          main: '#5745DE',
        },
        pangoro: {
          main: '#5745DE',
        },
        ropsten: {
          main: '#e6007a',
        },
      }),
      maxWidth: {
        'eth-account': '25em',
        'polkadot-account': '30em',
      },
    },
  },
  plugins: [
    require('tailwindcss-pseudo-elements')({
      customPseudoClasses: ['step'],
      customPseudoElements: ['div'],
      emptyContent: false,
    }),
  ],
  variants: {
    extend: {
      backgroundColor: ['before', 'after'],
      backgroundOpacity: ['before', 'after'],
    },
  },
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
};
