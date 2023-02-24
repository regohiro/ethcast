import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

interface Account {
  address: string;
  privateKey: string;
}

const ACCOUNTS_TO_GENERATE = 10;

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnemonic] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    setMnemonic(mnemonic);

    const node = ethers.utils.HDNode.fromMnemonic(mnemonic);
    for (let i = 0; i < ACCOUNTS_TO_GENERATE; i++) {
      const { address, privateKey } = node.derivePath("m/44'/60'/0'/0/" + i);
      setAccounts((prev) => [...prev, { address, privateKey }]);
    }

    setIsLoading(false);
  }, []);

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Mnemonic"
        icon={Icon.Leaf}
        accessories={[{ text: mnemonic }]}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard content={mnemonic} />
          </ActionPanel>
        }
      />

      {accounts.map(({ address, privateKey }, index) => (
        <List.Section title={`Account #${index}`} key={index}>
          <List.Item
            title="Address"
            icon={Icon.Person}
            accessories={[{ text: address }]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={address} />
              </ActionPanel>
            }
          />
          <List.Item
            title="Private Key"
            icon={Icon.Key}
            accessories={[{ text: privateKey }]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={privateKey} />
              </ActionPanel>
            }
          />
        </List.Section>
      ))}
    </List>
  );
}
