import "./App.css";

import { useEffect, useState } from "react";
import { VictoryPie } from "victory";
import * as query from "./contract/query";

const apollo_lockdrop_address = "terra120z72wqvrtfjgyxcdnhnxn5e5chxz7ruud290n"; //  apollo
const xastro_address = "terra14lpnyzc9z4g3ugr4lhm8s4nle0tq8vcltkhzh7"; //  xastro
const apollo_warchest_address = "terra1hxrd8pnqytqpelape3aemprw3a023wryw7p0xn"; //  warchest
const reactor_lockdrop_address = "terra1jnf3m3rkns52husav43zyzc857wxts00vdr8j2"; //  reactor
const orion_address = "terra18mguewx2kvmkd4xq676xgxe795hne0a4s4qte0"; //  orion
const retrograde_lockdown_address =
  "terra1amcm2gv6zqznrd2hlsgru58c4ytvl9jqwu8e8y"; //  retrograde

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

function ItemBox({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h4 style={{ fontWeight: 500, fontSize: 20, margin: 0, marginBottom: 4 }}>
        {value}
      </h4>
      <span style={{ fontSize: 12, opacity: 0.4, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({
  totalOwnedByDaos,
  totalSupply,
  percentCirculatingSupplyOwned,
}) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 16,
        borderColor: "#FFF",
        backgroundColor: "#0d1841",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <ItemBox value={totalOwnedByDaos} label="TOTAL XASTRO OWNED BY DAOs" />
        <ItemBox value={totalSupply} label="TOTAL SUPPLY" />
        <ItemBox
          value={`${percentCirculatingSupplyOwned}%`}
          label="% OF CIRCULATING SUPPLY OWNED"
        />
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [supply, setSupply] = useState(0);
  const [balances, setBalances] = useState({});

  function updateData({ balance, supply, balances }) {
    setSupply(supply);
    setBalance(balance);
    setBalances(balances);
    setLoading(false);
  }

  useEffect(() => {
    async function fetch() {
      const { balance, supply, balances } = await fetchData();
      updateData({ balance, supply, balances });
      const percentage = (balance / supply) * 100;
      document.title = `xAstro Wars Tracker ${percentage.toFixed(2)}%`;
    }

    fetch().catch(console.error);
  }, []);

  const pieData = buildData(balances);
  const percentage = (balance / supply) * 100;
  const percentCirculatingSupplyOwned = (percentage || 0).toFixed(2);

  return loading ? (
    <h1>Loading On Chain Data...</h1>
  ) : (
    <div>
      <div style={{ padding: 32 }}>
        <InfoRow
          totalOwnedByDaos={formatAmount(Math.floor(balance))}
          totalSupply={formatAmount(Math.floor(supply))}
          percentCirculatingSupplyOwned={percentCirculatingSupplyOwned}
        />
      </div>
      <div style={{ height: 300, marginBottom: 32, marginTop: 32 }}>
        <VictoryPie
          data={pieData}
          colorScale={["tomato", "orange", "gold", "cyan", "navy"]}
          style={{
            labels: { fill: "white", fontSize: 22 },
          }}
        />
      </div>
      <button
        type="button"
        onClick={async () => {
          setLoading(true);
          const { balance, supply, balances } = await fetchData();
          updateData({ balance, supply, balances });
        }}
      >
        Update Data
      </button>
    </div>
  );
}

export default App;
