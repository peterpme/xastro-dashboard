// sync-ed from root via `tr sync-refs`
import config from "../refs.terrain.json";
export const contractAdress = (wallet) => {
  console.log("wallet", wallet);
  console.log("config", config);
  const a = config[wallet.network.name].counter.contractAddresses.default;
  console.log("a", a);
  return a;
};
