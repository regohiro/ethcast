import { Action, ActionPanel, List, Toast, showToast } from "@raycast/api";
import { useState } from "react";
import axios from "axios";

interface Item {
  name: string;
  filtered: boolean;
}

interface Res {
  ok: boolean;
  result: {
    function: {
      [key: string]: Item[];
    };
  };
}

export default function Command() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const doSearch = async (input: string) => {
    const isHex = RegExp("0[xX][0-9a-fA-F]+");
    if (input.length != 10 || !isHex.test(input)) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get<Res>("https://api.openchain.xyz/signature-database/v1/lookup", {
        params: {
          filter: false,
          function: input,
        },
      });
      if (res.status === 200 && res.data.ok) {
        setItems(res.data.result.function[input]);
      }
    } catch (err: any) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to query",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <List
      navigationTitle="Search Function Signature"
      searchBarPlaceholder="Enter selectors..."
      onSearchTextChange={doSearch}
      isLoading={loading}
    >
      {items.map((item, index) => (
        <List.Item
          key={index}
          title={item.name}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content={item.name} />
              <Action.Paste content={item.name} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
