import { BridgeVersion } from "../../types";
import { useCallback, useState } from "react";
import VersionSwitch from "./version-switch";
import Tabs from "./tabs";
import Overview from "./overview";
import RelayerProviderV3 from "../../providers/relayer-provider-v3";
import RelayerRegisterV3 from "../relayer-register-v3";
import RelayerProvider from "../../providers/relayer-provider";
import RelayerRegister from "../relayer-register";
import Manage from "./manage";

type TabKey = "manage" | "register" | "overview";

export default function Relayer() {
  const [activeTab, setActiveTab] = useState<TabKey>("manage");
  const [version, setVersion] = useState<BridgeVersion>("lnv3");

  const handleManage = useCallback(() => setActiveTab("manage"), []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full justify-end lg:w-[40rem]">
        <VersionSwitch value={version} onChange={setVersion} />
      </div>

      <Tabs
        options={[
          {
            key: "manage",
            label: "Manage",
            children:
              version === "lnv3" ? (
                <RelayerProviderV3>
                  <Manage version={version} />
                </RelayerProviderV3>
              ) : (
                <RelayerProvider>
                  <Manage version={version} />
                </RelayerProvider>
              ),
          },
          {
            key: "register",
            label: "Register",
            children:
              version === "lnv3" ? (
                <RelayerProviderV3>
                  <RelayerRegisterV3 onManage={handleManage} />
                </RelayerProviderV3>
              ) : (
                <RelayerProvider>
                  <RelayerRegister onManage={handleManage} />
                </RelayerProvider>
              ),
          },
          { key: "overview", label: "Overview", children: <Overview version={version} /> },
        ]}
        className="lg:w-[40rem]"
        activeKey={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}
