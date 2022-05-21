import { ClientContext, GraphQLClient } from 'graphql-hooks';
import { createContext, useMemo } from 'react';

export const GqlContext = createContext<null>(null);

const subqlDev = 'http://localhost:3000/';

export const GqlProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  // const { network } = useApi();

  const value = useMemo(() => {
    const client = new GraphQLClient({
      url: subqlDev,
    });

    return client;
  }, []);

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};
