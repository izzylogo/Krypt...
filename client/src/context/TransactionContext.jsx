import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers'

import {contractABI, contractAddress}  from '../utils/constants'

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;

    // console.log({
    //     provider,
    //     signer,
    //     transactionsContract
    // })
}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("")
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''})
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    const [transactions, setTransactions] = useState([])

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}))
    }

    const getAllTransactions = async() => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionsContract = getEthereumContract(); 
            const availableTransactions = await transactionsContract.getAllTransactions()
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }))

            console.log(structuredTransactions)
            setTransactions(structuredTransactions)

        } catch (error) {
            console.error(error)
        }
    }

    // Checking if wallet is connected
    const checkIfWalletisConnected = async() => {
        try {
            
            if(!ethereum) return alert("Please install metamask");
    
            const accounts = await ethereum.request({
                method: "eth_accounts",// you can use (method: "eth_requestAccounts") to connect automatically
            });
    
            if(accounts.length) {
                setCurrentAccount(accounts[0]);
    
                getAllTransactions()
            }else {
                console.log("No accounts found")
            }
        } catch (error) {
            console.error(error)
            throw new Error("No ethereum object")
        }
        // console.log(accounts)
    }

    const checkIfTransactionsExist = async() => {
        try {
            const transactionsContract = getEthereumContract();   
            const transactionCount = await transactionsContract.getTransactionCount();

            window.localStorage.setItem('transactionCount', transactionCount)
        } catch (error) {
            console.error(error)
            throw new Error("No ethereum object..")
        }
    }


    // function to connect the wallet
    const connectWallet = async() => {
        try{
            // checking if the browser has a wallet
            if(!ethereum) return alert("Please install metamask");

            // getting a request to connect to the wallet
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            // setting it to the first account that is to be connected
            setCurrentAccount(accounts[0]);
        }catch(error){
            console.error(error)
            throw new Error("No ethereum object..")
        }
    }

    const sendTransaction = async() => {
        try {
            if(!ethereum) return alert("Please install metamask");

            // get the data from the form...... 
            const { addressTo, amount, keyword, message } = formData;
            const transactionsContract = getEthereumContract();   
            const parseAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //2100 GWEI
                    value: parseAmount._hex,
                }]
            })

            const transactionHash = await transactionsContract.addToBlockchain(addressTo, parseAmount, message, keyword);

            setIsLoading(true)
            console.log(`Loading - ${transactionHash.hash}`)
            await transactionHash.wait()
            setIsLoading(false)
            console.log(`Success - ${transactionHash.hash}`)

            const transactionCount = await transactionsContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber())

            window.reload()
        } catch (error) {
            console.error(error)
            // throw new Error("No ethereum object")
        }
    }

    useEffect(() => {
        checkIfWalletisConnected();
        checkIfTransactionsExist();
      }, [])

    return (
        //passing the value of all the use context to other components
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading}}>
            {children}
        </TransactionContext.Provider>
    )
}