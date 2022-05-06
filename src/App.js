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
      const percent =
        (parseInt(value, 10) / balances.totalContractBalance) * 100;

      return {
        label: `${label}: ${percent.toFixed(1)}%`,
        y: percent,
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

function BottomMargin({ children }) {
  return (
    <div
      style={{
        marginBottom: window.innerWidth < 500 ? 24 : 0,
      }}
    >
      {children}
    </div>
  );
}

function ItemBox({ value, label }) {
  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 500, fontSize: 20, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, opacity: 0.4, fontWeight: 500 }}>{label}</div>
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
          display: window.innerWidth < 500 ? "flex-col" : "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <BottomMargin>
          <ItemBox
            value={totalOwnedByDaos}
            label="Total xAstro owned by DAOs"
          />
        </BottomMargin>
        <BottomMargin>
          <ItemBox value={totalSupply} label="Total supply" />
        </BottomMargin>
        <ItemBox
          value={`${percentCirculatingSupplyOwned}%`}
          label="% of circulating supply owned"
        />
      </div>
    </div>
  );
}

function StyledTwitterLink({ name, label }) {
  return (
    <a
      style={{ color: "#4c5bbb", fontSize: 14 }}
      href={`https://twitter.com/${name}`}
      target="_blank"
      rel="noreferrer"
      title={`${name} on Twitter`}
    >
      {label}
    </a>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [supply, setSupply] = useState(0);
  const [balances, setBalances] = useState({});
  const [countdown, setCountdown] = useState(30);

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
      document.title = `${percentage.toFixed(2)}% xAstro Wars Tracker`;
    }

    fetch().catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (countdown <= 1) {
        const { balance, supply, balances } = await fetchData();
        updateData({ balance, supply, balances });
        setCountdown(30);
      } else {
        setCountdown((countdown) => countdown - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const pieData = buildData(balances);
  const percentage = (balance / supply) * 100;
  const percentCirculatingSupplyOwned = (percentage || 0).toFixed(2);

  return loading ? (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 16, textAlign: "center", padding: 12 }}>
        Loading On Chain Data...
      </span>
    </div>
  ) : (
    <div>
      <div style={{ padding: window.innerWidth < 500 ? 24 : 32 }}>
        <InfoRow
          totalOwnedByDaos={formatAmount(Math.floor(balance))}
          totalSupply={formatAmount(Math.floor(supply))}
          percentCirculatingSupplyOwned={percentCirculatingSupplyOwned}
        />
      </div>
      <div
        style={{
          height: window.innerWidth < 500 ? 200 : 300,
          marginBottom: 32,
          marginTop: 32,
        }}
      >
        <VictoryPie
          data={pieData}
          colorScale={["tomato", "orange", "gold", "cyan", "navy"]}
          style={{
            labels: { fill: "white", fontSize: 22 },
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            backgroundColor: "#5643f2",
            color: "#FFF",
            fontSize: 13,
            paddingLeft: 40,
            paddingRight: 40,
            paddingTop: 8,
            paddingBottom: 8,
            borderWidth: 0,
            borderRadius: 32,
            cursor: "pointer",
          }}
          type="button"
          onClick={async () => {
            setLoading(true);
            const { balance, supply, balances } = await fetchData();
            updateData({ balance, supply, balances });
          }}
        >
          Refresh Data <span style={{ opacity: 0.5 }}>({countdown})</span>
        </button>
      </div>
      <div
        style={{
          marginTop: 64,
          display: "flex",
          justifyContent: "center",
          alignItems: "center ",
        }}
      >
        <div style={{ marginRight: 8 }}>
          <StyledTwitterLink name="peterpme" label="web2peter" />
        </div>{" "}
        |
        <div style={{ marginLeft: 8 }}>
          <StyledTwitterLink name="AnonNgmi" label="anon intern" />
        </div>
      </div>
    </div>
  );
}

export default App;
