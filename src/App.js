import "./App.css";

import { useEffect, useState } from "react";
import { VictoryPie } from "victory";
import * as query from "./contract/query";

const addresses = {
  apollolockdropBalance: "Apollo Lockdrop",
  apolloWarchestBalance: "Apollo Warchest",
  reactorBalance: "Reactor",
  orionBalance: "Orion",
  retrogradeBalance: "Retrograde",
};

export const calculateDecimals = (amount, decimals) => {
  return amount / Math.pow(10, decimals);
};

function formatAmount(amount = "0") {
  return amount ? amount.toLocaleString("en-US") : "0";
}

function getLabel(key) {
  return addresses[key];
}

function buildData(balances) {
  console.log(balances);
  return Object.keys(balances)
    .map((key, index) => {
      if (key === "totalContractBalance") {
        return false;
      }

      const value = balances[key];
      const label = getLabel(key);
      const percent = (
        (parseInt(value, 10) / balances.totalContractBalance) *
        100
      ).toFixed(1);

      return {
        label: `${label}: ${percent}%`,
        y: value,
      };
    })
    .filter(Boolean);
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

  const apollolockdropBalance = await getBalance(
    apollo_lockdrop_address,
    xastro_address
  );
  console.log("lockdrop: " + apollolockdropBalance);
  totalBalanceArray.push(apollolockdropBalance);

  const apolloWarchestBalance = await getBalance(
    apollo_warchest_address,
    xastro_address
  );
  console.log("warchest: " + apolloWarchestBalance);
  totalBalanceArray.push(apolloWarchestBalance);

  const reactorBalance = await getBalance(
    reactor_lockdrop_address,
    xastro_address
  );
  console.log("reactor: " + reactorBalance);
  totalBalanceArray.push(reactorBalance);

  const orionBalance = await getBalance(orion_address, xastro_address);
  console.log("orion: " + orionBalance);
  totalBalanceArray.push(orionBalance);

  const retrogradeBalance = await getBalance(
    retrograde_lockdown_address,
    xastro_address
  );
  console.log("retrograde: " + retrogradeBalance);
  totalBalanceArray.push(retrogradeBalance);

  totalContractBalance = totalBalanceArray.reduce(
    (n, s) => Number(n) + Number(s)
  );

  console.log("totalContractBalance: " + totalContractBalance);
  return {
    totalContractBalance,
    apollolockdropBalance,
    apolloWarchestBalance,
    reactorBalance,
    orionBalance,
    retrogradeBalance,
  };
};

const getBalance = async (contract_address, token_address) => {
  const { balance } = await query.getBalance(token_address, contract_address);
  return balance;
};

const fetchData = async () => {
  const { totalContractBalance, ...balances } = await getTotalBalance();
  const { decimals, total_supply } = await query.getTokenInfo(xastro_address);

  const balance = calculateDecimals(totalContractBalance, decimals);
  const supply = calculateDecimals(total_supply, decimals);

  return { balance, supply, balances: { ...balances, totalContractBalance } };
};

function App() {
  const [balance, setBalance] = useState(0);
  const [supply, setSupply] = useState(0);
  const [balances, setBalances] = useState({});

  function updateData({ balance, supply, balances }) {
    setSupply(supply);
    setBalance(balance);
    setBalances(balances);
  }

  useEffect(() => {
    async function fetch() {
      const { balance, supply, balances } = await fetchData();
      updateData({ balance, supply, balances });
      const percentage = (balance / supply) * 100;
      document.title = `Astro Wars Tracker ${percentage}%`;
    }

    fetch().catch(console.error);
  }, []);

  const pieData = buildData(balances);
  const percentage = (balance / supply) * 100;

  return (
    <div>
      TOTAL XASTRO OWNED BY DAOs: {formatAmount(balance)} xASTRO
      <br />
      TOTAL SUPPLY: {formatAmount(supply)} xASTRO
      <br />% OF CIRCULATING SUPPLY OWNED: {(percentage || 0).toFixed(2)}%
      <br />
      <button
        type="button"
        onClick={async () => {
          const { balance, supply, balances } = await fetchData();
          updateData({ balance, supply, balances });
        }}
      >
        Update Data
      </button>
      <div style={{ height: 300 }}>
        <VictoryPie
          data={pieData}
          colorScale={["tomato", "orange", "gold", "cyan", "navy"]}
        />
      </div>
    </div>
  );
}

export default App;
