import { Action, ActionPanel, List, Toast, showToast, Cache } from "@raycast/api";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Fuse from "fuse.js";

interface Token {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>;
}

interface TokenInfoProps {
  name: string;
  platforms: Record<string, string>;
}

const explorers: Record<string, string> = {
  ethereum: "https://etherscan.io/token/",
  "polygon-pos": "https://polygonscan.com/token/",
  "binance-smart-chain": "https://bscscan.com/token/",
  solana: "https://solscan.io/token/",
  "arbitrum-one": "https://arbiscan.io/token/",
  avalanche: "https://snowtrace.io/token/",
  fantom: "https://ftmscan.com/token/",
  "optimistic-ethereum": "https://optimistic.etherscan.io/token/",
  "harmony-shard-0": "https://explorer.harmony.one/address/",
  tron: "https://tronscan.org/#/token20/",
  energi: "https://explorer.energi.network/token/",
  "huobi-token": "https://www.hecoinfo.com/en-us/token/",
  aptos: "https://aptoscan.com/coin/",
  astar: "https://blockscout.com/astar/token/",
  cronos: "https://cronoscan.com/token/",
  // I will let the contributors to add more networks 
};

function TokenInfo({ name, platforms: platformsObj }: TokenInfoProps) {
  const platforms = Object.entries(platformsObj);

  return (
    <List navigationTitle={name}>
      <List.Section title={`${name}  (${platforms.length} chains)`}>
        {platforms.map(([platform, address], index) => (
          <List.Item
            key={index}
            keywords={[address]}
            title={platform}
            accessories={[{ text: address }]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={address} />
                <Action.Paste content={address} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
                {explorers[platform] && (
                  <Action.OpenInBrowser
                    title="Open in Explorer"
                    url={explorers[platform] + address}
                    shortcut={{ modifiers: ["cmd", "opt"], key: "o" }}
                  />
                )}
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

export default function Command() {
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [items, setItems] = useState<Token[]>([]);

  const cache = new Cache();
  const fuse = new Fuse(tokens, {
    keys: ["name", "symbol"],
    distance: 0,
  });

  const doSearch = (text: string) => {
    if (!text) {
      setItems([]);
      return;
    }
    const items = fuse
      .search(text, {
        limit: 30,
      })
      .map((item) => item.item);
    setItems(items);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Use cached tokens
        const cachedTokens = cache.get("ethcast.tokens");
        if (cachedTokens) {
          setTokens(JSON.parse(cachedTokens));
          setLoading(false);
        }

        // Return if last update is less than 24 hours
        const ONE_DAY = 86_400_000;
        const lastUpdated = cache.get("ethcast.tokensUpdated");
        if (lastUpdated && Date.now() - Number(lastUpdated) < ONE_DAY) {
          return;
        }

        // Get latest coins list from coingecko
        const { data: fetchedTokens } = await axios.get<Token[]>(
          "https://api.coingecko.com/api/v3/coins/list",
          {
            params: {
              include_platform: true,
            },
            timeout: 5000, // 5 seconds
          }
        );

        // Remove unnesseary tokens
        const tokens = fetchedTokens.filter((token) => Object.keys(token.platforms).length > 0);

        // Set tokens
        setTokens(tokens);
        cache.set("ethcast.tokens", JSON.stringify(tokens));
        cache.set("ethcast.tokensUpdated", Date.now().toString());
      } catch (error) {
        // Display error only if tokens info is not cached
        if (!cache.get("tokens")) {
          const err = error as AxiosError;
          showToast({
            style: Toast.Style.Failure,
            title: "Failed to fetch tokens",
            message: err.message,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <List
      navigationTitle="Search Token Address"
      searchBarPlaceholder="Enter token name or symbol..."
      filtering={false}
      onSearchTextChange={doSearch}
      isLoading={loading}
    >
      {items.map((token, index) => (
        <List.Item
          key={index}
          title={token.name}
          subtitle={token.symbol.toUpperCase()}
          accessories={[
            ...Object.keys(token.platforms)
              .slice(0, 3)
              .map<List.Item.Accessory>((platform) => ({
                tag: platform,
              })),
            {
              text: `${Object.keys(token.platforms).length} chains`,
            },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View token addresses"
                target={<TokenInfo name={token.name} platforms={token.platforms} />}
              />
              <Action.CopyToClipboard
                title="Copy token addresses as JSON"
                content={JSON.stringify(token.platforms)}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
