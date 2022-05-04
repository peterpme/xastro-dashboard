import './App.css'

import { useEffect, useState } from 'react'
import {
  useWallet,
  useConnectedWallet,
  WalletStatus,
} from '@terra-money/wallet-provider'

import * as execute from './contract/execute'
import * as query from './contract/query'
import { ConnectWallet } from './components/ConnectWallet'

function App() {
  const [balance, setBalance] = useState(null)
  const [percentage, setPercentage] = useState(null)
  const [supply, setSupply] = useState(null)

  const [updating, setUpdating] = useState(true)
  const [resetValue, setResetValue] = useState(0)

  const { status } = useWallet()

  const connectedWallet = useConnectedWallet()
  
  const apollo_lockdrop_address = "terra120z72wqvrtfjgyxcdnhnxn5e5chxz7ruud290n" //  apollo
  const xastro_address = "terra14lpnyzc9z4g3ugr4lhm8s4nle0tq8vcltkhzh7"  //  xastro
  const apollo_warchest_address = "terra1hxrd8pnqytqpelape3aemprw3a023wryw7p0xn"  //  warchest

  const reactor_lockdrop_address = "terra1jnf3m3rkns52husav43zyzc857wxts00vdr8j2"  //  reactor
  const orion_address = "terra18mguewx2kvmkd4xq676xgxe795hne0a4s4qte0" //  orion

  const retrograde_lockdown_address = "terra1amcm2gv6zqznrd2hlsgru58c4ytvl9jqwu8e8y"  //  retrograde

  useEffect(() => {
    
  }, [connectedWallet])

  const getTotalBalance = async() => {
    let totalBalanceArray = []
    let totalContractBalance = 0

    const apolloLockDropBalance = await getBalance(apollo_lockdrop_address, xastro_address)
    console.log("lockdrop: " + apolloLockDropBalance)
    totalBalanceArray.push(apolloLockDropBalance)

    const apolloWarchestBalance = await getBalance(apollo_warchest_address, xastro_address)
    console.log("warchest: " + apolloWarchestBalance)
    totalBalanceArray.push(apolloWarchestBalance)

    const reactorLockdropAddress = await getBalance(reactor_lockdrop_address, xastro_address)
    console.log("reactor: " + reactorLockdropAddress)
    totalBalanceArray.push(reactorLockdropAddress)

    const orionAddress = await getBalance(orion_address, xastro_address)
    console.log("orion: " + orionAddress)
    totalBalanceArray.push(orionAddress)

    const retroGradeAddress = await getBalance(retrograde_lockdown_address, xastro_address)
    console.log("retrograde: " + retroGradeAddress)
    totalBalanceArray.push(retroGradeAddress)

    totalContractBalance = totalBalanceArray.reduce((n, s) => Number(n) + Number(s))

    console.log("totalContractBalance: " + totalContractBalance)
    return totalContractBalance
  }

  const getBalance = async(contract_address, token_address) => {
    const response = await query.getBalance(connectedWallet, token_address, contract_address)
    console.log(response)
    return response.balance
  }

  const getTotalSupply = async(connectedWallet, token_address) => {
    const tokenInfo = await query.getTokenInfo(connectedWallet, token_address)
    const totalSupply = tokenInfo.total_supply
    console.log(totalSupply)
    return totalSupply
  }

  const getAstro = async() => {
    let totalContractBalance = await getTotalBalance()
    console.log("gettotal: " + totalContractBalance)

    const tokenInfo = await query.getTokenInfo(connectedWallet, xastro_address)

    //  10^6
    totalContractBalance = (totalContractBalance) / (Math.pow(10, tokenInfo.decimals))
    console.log("totalContractBalance:", totalContractBalance)
    
    //  total supply
    let totalSupply = tokenInfo.total_supply
    totalSupply = (totalSupply) / (Math.pow(10, tokenInfo.decimals))
    console.log("totalSupply:", totalSupply)
    setSupply(totalSupply.toLocaleString("en-US"))

    let newPercentage = ((totalContractBalance) / (totalSupply) * 100)

    console.log("newPercentage:", newPercentage)
    setPercentage(newPercentage)
    setBalance(totalContractBalance.toLocaleString("en-US"))

  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'inline' }}>
          TOTAL XASTRO OWNED BY DAOs: {balance} xASTRO<br/>
          TOTAL SUPPLY: {supply} xASTRO<br/>
          % OF CIRCULATING SUPPLY OWNED: {percentage}<br/>
          <button onClick={getAstro} type="button">
            Get Balance
          </button>
        </div>
        {status === WalletStatus.WALLET_CONNECTED && (
          <div style={{ display: 'inline' }}>
            
          </div>
        )}
        <ConnectWallet />
      </header>
    </div>
  )
}

export default App
