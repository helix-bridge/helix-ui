export const endpoint =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4002/graphql'
    : 'https://wormhole-apollo.darwinia.network/';
