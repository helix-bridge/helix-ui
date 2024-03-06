import TransferInformation from "./transfer-information";
import TransferSection from "./transfer-section";

interface Props {}

export default function TransferInformationSection({}: Props) {
  return (
    <TransferSection titleText="Information">
      <TransferInformation estimatedTime={{ loading: true }} />
    </TransferSection>
  );
}
