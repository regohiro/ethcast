import { Action, ActionPanel, Icon, List, getPreferenceValues } from "@raycast/api";
import { ethers } from "ethers";
import { useMemo } from "react";
import { Perferences } from "./common/preferences";

interface Account {
  address: string;
  privateKey: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Perferences>();

  const { mnemonic, accounts } = useMemo(() => {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;

    const accounts: Account[] = [];
    const numOfAccounts = Number(preferences.accounts);
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic);
    for (let i = 0; i < numOfAccounts; i++) {
      const { address, privateKey } = node.derivePath("m/44'/60'/0'/0/" + i);
      accounts.push({ address, privateKey });
    }

    return { mnemonic, accounts };
  }, []);

  return (
    <List isLoading={mnemonic === ""}>
      <List.Item
        title="Mnemonic"
        icon={Icon.Leaf}
        accessories={[{ text: mnemonic }]}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard content={mnemonic} />
            <Action.Paste content={mnemonic} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
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
                <Action.Paste content={address} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
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
                <Action.Paste content={privateKey} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
              </ActionPanel>
            }
          />
        </List.Section>
      ))}
    </List>
  );
}
