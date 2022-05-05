import "./App.css";

import { useEffect, useState } from "react";
import * as query from "./contract/query";

export const calculateDecimals = (amount, decimals) => {
  return amount / Math.pow(10, decimals);
};

function formatAmount(amount = "0") {
  return amount ? amount.toLocaleString("en-US") : "0";
}

const apollo_lockdrop_address = "terra120z72wqvrtfjgyxcdnhnxn5e5chxz7ruud290n"; //  apollo
const xastro_address = "terra14lpnyzc9z4g3ugr4lhm8s4nle0tq8vcltkhzh7"; //  xastro
const apollo_warchest_address = "terra1hxrd8pnqytqpelape3aemprw3a023wryw7p0xn"; //  warchest

const reactor_lockdrop_address = "terra1jnf3m3rkns52husav43zyzc857wxts00vdr8j2"; //  reactor
const orion_address = "terra18mguewx2kvmkd4xq676xgxe795hne0a4s4qte0"; //  orion

const retrograde_lockdown_address =
  "terra1amcm2gv6zqznrd2hlsgru58c4ytvl9jqwu8e8y"; //  retrograde

const getTotalBalance = async () => {
  let totalBalanceArray = [];
  let totalContractBalance = 0;

  const apolloLockDropBalance = await getBalance(
    apollo_lockdrop_address,
    xastro_address
  );
  console.log("lockdrop: " + apolloLockDropBalance);
  totalBalanceArray.push(apolloLockDropBalance);

  const apolloWarchestBalance = await getBalance(
    apollo_warchest_address,
    xastro_address
  );
  console.log("warchest: " + apolloWarchestBalance);
  totalBalanceArray.push(apolloWarchestBalance);

  const reactorLockdropAddress = await getBalance(
    reactor_lockdrop_address,
    xastro_address
  );
  console.log("reactor: " + reactorLockdropAddress);
  totalBalanceArray.push(reactorLockdropAddress);

  const orionAddress = await getBalance(orion_address, xastro_address);
  console.log("orion: " + orionAddress);
  totalBalanceArray.push(orionAddress);

  const retroGradeAddress = await getBalance(
    retrograde_lockdown_address,
    xastro_address
  );
  console.log("retrograde: " + retroGradeAddress);
  totalBalanceArray.push(retroGradeAddress);

  totalContractBalance = totalBalanceArray.reduce(
    (n, s) => Number(n) + Number(s)
  );

  console.log("totalContractBalance: " + totalContractBalance);
  return totalContractBalance;
};

const getBalance = async (contract_address, token_address) => {
  const { balance } = await query.getBalance(token_address, contract_address);
  return balance;
};

const fetchData = async () => {
  const totalContractBalance = await getTotalBalance();
  const { decimals, total_supply } = await query.getTokenInfo(xastro_address);

  const balance = calculateDecimals(totalContractBalance, decimals);
  const supply = calculateDecimals(total_supply, decimals);

  return { balance, supply };
};

function App() {
  const [balance, setBalance] = useState(0);
  const [supply, setSupply] = useState(0);

  const circulatingPercentage = (balance / supply) * 100;

  function updateData({ balance, supply }) {
    setSupply(supply);
    setBalance(balance);
  }

  useEffect(() => {
    async function fetch() {
      const { balance, supply } = await fetchData();
      updateData({ balance, supply });
    }

    fetch().catch(console.error);
  }, []);

  return (
    <div>
      TOTAL XASTRO OWNED BY DAOs: {formatAmount(balance)} xASTRO
      <br />
      TOTAL SUPPLY: {formatAmount(supply)} xASTRO
      <br />% OF CIRCULATING SUPPLY OWNED:{" "}
      {(circulatingPercentage || 0).toFixed(2)}%
      <br />
      <button
        onClick={async () => {
          const { balance, supply } = await fetchData();
          updateData({ balance, supply });
        }}
        type="button"
      >
        Update Data
      </button>
    </div>
  );
}

export default App;
