import { LCDClient } from '@terra-money/terra.js'
import { IdentifiedClientState } from '@terra-money/terra.js/dist/core/ibc/msgs/client/IdentifiedClient'
import { contractAdress } from './address'

export const getCount = async (wallet) => {
  const lcd = new LCDClient({
    URL: wallet.network.lcd,
    chainID: wallet.network.chainID,
  })
  return lcd.wasm.contractQuery(contractAdress(wallet), { get_count: {} })
}


export const getBalance = async (wallet, token_address, account_address) => {
  const lcd = new LCDClient({
    URL: wallet.network.lcd,
    chainID: wallet.network.chainID,
  })
  return lcd.wasm.contractQuery(token_address, { balance: { address: account_address } })
}

export const getTokenInfo = async (wallet, contract_address) => {
  const lcd = new LCDClient({
    URL: wallet.network.lcd,
    chainID: wallet.network.chainID,
  })
  return lcd.wasm.contractQuery(contract_address, { "token_info": {}})
}
