import React, { useEffect, useState } from "react";
import allpool from "./allpool.module.css";
import axios from "axios";
import { GRAPH_ENDPOINT } from "constants/lists";
import { Tooltip } from "@nextui-org/react";

// Define the types for the data
interface TokenDayData {
  volumeUSD: string;
  date: number;
  priceUSD: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  derivedETH: string;
  tokenDayData: TokenDayData[];
}

// Helper function to format large numbers
const formatLargeNumber = (num: number): string => {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  }
  return num.toFixed(2);
};

interface TokenTableProps {
  searchQuery: string;
}

export function TokenTable({ searchQuery }: TokenTableProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.post(GRAPH_ENDPOINT, {
          query: `
              {
                tokens(first: 25, orderDirection: desc, orderBy: volumeUSD) {
                  id
                  name
                  symbol
                  totalSupply
                  derivedETH
                  tokenDayData(first: 7, orderBy: date, orderDirection: desc) {
                    volumeUSD
                    date
                    priceUSD
                  }
                }
              }
            `,
        });
        setTokens(response.data.data.tokens);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching token data: ", error);
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const calculatePercentageChange = (
    current: number,
    previous: number,
  ): string => {
    if (previous === 0) {
      return "N/A"; // Avoid division by zero
    }
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(2) + "%";
  };

  // Filter tokens based on the search query
  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="">
      <div className={allpool.tablediv}>
        <div className={allpool.head}>
          <table className={allpool.table}>
            <thead>
              <tr className={allpool.row}>
                <th className={allpool.column1}>#</th>
                <th className={allpool.column2}>Token name</th>
                <th className={allpool.column3}>Price (USD)</th>
                <th className={allpool.column4}>1 day</th>
                <th className={allpool.column5}>7 days</th>
                <Tooltip
                  content="Fully diluted valuation (FDV) calculates the total market value assuming all tokens are in circulation."
                  className={allpool.tooltipAPR}
                >
                  <th className={allpool.column6} style={{ cursor: "pointer" }}>
                    FDV (USD)
                  </th>
                </Tooltip>
                <th className={allpool.column7}>1d Volume (USD)</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className={allpool.content}>
          {loading ? (
            <div style={{ textAlign: "center" }}>
              <span className={allpool.loader}></span>
            </div>
          ) : (
            <table className={allpool.table}>
              <tbody>
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", margin: "20px 0px" }}
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((token, index) => {
                    const currentPriceUSD = parseFloat(
                      token.tokenDayData[0].priceUSD,
                    );
                    const fdv = currentPriceUSD * parseFloat(token.totalSupply);

                    const previousDayPriceUSD = token.tokenDayData[1]
                      ? parseFloat(token.tokenDayData[1].priceUSD)
                      : 0;
                    const oneDayChange = calculatePercentageChange(
                      currentPriceUSD,
                      previousDayPriceUSD,
                    );

                    const sevenDayPriceUSD = token.tokenDayData[6]
                      ? parseFloat(token.tokenDayData[6].priceUSD)
                      : 0;
                    const sevenDayChange = calculatePercentageChange(
                      currentPriceUSD,
                      sevenDayPriceUSD,
                    );

                    const latestVolume = parseFloat(
                      token.tokenDayData[0].volumeUSD,
                    );

                    return (
                      <tr className={allpool.row} key={token.id}>
                        <td className={allpool.column1}>{index + 1}</td>
                        <td className={allpool.column2}>
                          {token.name} ({token.symbol})
                        </td>
                        <td className={allpool.column3}>
                          ${currentPriceUSD.toFixed(2)}
                        </td>
                        <td className={allpool.column4}>{oneDayChange}</td>
                        <td className={allpool.column5}>{sevenDayChange}</td>
                        <td className={allpool.column6}>
                          ${formatLargeNumber(fdv)}
                        </td>
                        <td className={allpool.column7}>
                          ${formatLargeNumber(latestVolume)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
