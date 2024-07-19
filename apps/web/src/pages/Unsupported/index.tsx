import React from "react";
import "./unsupported.css";
import network from "../../assets/images/network.gif";
import { ChainId } from "lampros-core";
import useSelectChain from "hooks/useSelectChain";
import useSyncChainQuery from "hooks/useSyncChainQuery";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";

export default function Unsupported() {
  const selectChain = useSelectChain();
  useSyncChainQuery();
  const navigate = useNavigate();
  const { chainId } = useWeb3React();

  const [pendingChainId, setPendingChainId] = useState<ChainId | undefined>(
    undefined,
  );

  const [isModeChain, setIsModeChain] = useState(false);

  useEffect(() => {
    // Check if the current chainId is Mode's chain ID (919)
    setIsModeChain(chainId === 919);
  }, [chainId]);

  const handleChainSwitch = async () => {
    if (!isModeChain) {
      await selectChain(919);
      navigate("/swap"); // Redirect to /swap after the chain is selected
    }
  };

  if (isModeChain) {
    // If already on Mode chain, redirect to /swap
    navigate("/swap");
    return null;
  }

  return (
    <div className="container">
      <div className="flexContainer">
        <div className="netIcon">
          <img src={network} alt="Network Icon"></img>
        </div>
        <div className="flexInfo">
          <div className="info1">
            Your wallet is connected to an unsupported chain
          </div>
          <div className="info2">
            Click the button below to change the chain
          </div>
        </div>

        <button className="switch" onClick={handleChainSwitch}>
          Switch to Mode
        </button>
      </div>
    </div>
  );
}
