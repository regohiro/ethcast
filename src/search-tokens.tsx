import { Action, ActionPanel, List, Toast, showToast, Cache } from "@raycast/api";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface Token {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>;
}

const ONE_DAY = 86_400_000;

interface TokenInfoProps {
  name: string;
  platforms: Record<string, string>;
}

function TokenInfo({ name, platforms: platformsObj }: TokenInfoProps) {
  const platforms = Object.entries(platformsObj);

  return (
    <List navigationTitle={name}>
      <List.Section title={`${name}  (${platforms.length} chains)`}>
        {platforms.map(([platform, address], index) => (
          <List.Item
            key={index}
            title={platform}
            accessories={[{ text: address }]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={address} />
                <Action.Paste content={address} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
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

  const cache = new Cache();

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
        const tokens = fetchedTokens
          .filter((token) => Object.keys(token.platforms).length > 0)
          .sort((a, b) => Object.keys(b.platforms).length - Object.keys(a.platforms).length);

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
      isLoading={loading}
    >
      {tokens.slice(0, 100).map((token, index) => (
        <List.Item
          key={index}
          title={token.name}
          keywords={[token.symbol]}
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