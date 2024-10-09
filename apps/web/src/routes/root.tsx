import Footer from "../components/footer";
import Header from "../components/header";
import AppProvider from "../providers/app-provider";
import GraphqlProvider from "../providers/graphql-provider";
import { Outlet } from "react-router-dom";
import WalletConnectProvider from "../providers/walletconnect-provider";

export default function Root() {
  return (
    <GraphqlProvider>
      <WalletConnectProvider>
        <AppProvider>
          <Header />
          <Outlet />
          <Footer />
        </AppProvider>
      </WalletConnectProvider>
    </GraphqlProvider>
  );
}
