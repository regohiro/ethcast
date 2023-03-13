import { Action, ActionPanel, Icon, List, getPreferenceValues } from "@raycast/api";
import { constants } from "ethers";

interface Item {
  title: string;
  value: string;
}

export default function Command() {
  const items: Item[] = [
    {
      title: "AddressZero",
      value: constants.AddressZero,
    },
    {
      title: "NativeToken",
      value: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    },
    {
      title: "HashZero",
      value: constants.HashZero,
    },
    {
      title: "WeiPerEther",
      value: constants.WeiPerEther.toString(),
    },
    {
      title: "MaxUint256",
      value: constants.MaxUint256.toString(),
    },
    {
      title: "MaxInt256",
      value: constants.MaxInt256.toString(),
    },
    {
      title: "Default Mnemonic",
      value: "test test test test test test test test test test test junk",
    },
  ];

  return (
    <List>
      {items.map(({ title, value }, index) => (
        <List.Item
          key={index}
          title={title}
          accessories={[{ text: value }]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content={value} />
              <Action.Paste content={value} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
