import { Outlet } from "react-router-dom";
import Header from "./components/header";
import AppProvider from "./providers/app-provider";
import GraphqlProvider from "./providers/graphql-provider";
import WalletConnectProvider from "./providers/walletconnect-provider";
import Footer from "./components/footer";

export default function Layout() {
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
