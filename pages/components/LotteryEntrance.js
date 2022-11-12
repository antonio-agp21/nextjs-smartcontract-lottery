import React, { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, addresses } from "../../constants/index.js";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled, provider } = useMoralis();

    const chainId = parseInt(chainIdHex);
    const raffleAddress = chainId in addresses ? addresses[chainId][0] : null;

    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    const dispatch = useNotification();

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    const {
        runContractFunction: enterRaffle,
        isFetching,
        isLoading,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    async function updateUI() {
        const feeFromCall = (await getEntranceFee()).toString();
        setEntranceFee(feeFromCall);
        setNumberOfPlayers((await getNumberOfPlayers()).toString());
        setRecentWinner((await getRecentWinner()).toString());
    }

    useEffect(() => {
        if (isWeb3Enabled && addresses[chainId] != null) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Transaction complete",
            title: "Tx Success",
            position: "topR",
            //icon: "bell",
        });
        updateUI();
    };

    const handleError = function () {
        dispatch({
            type: "error",
            message: "Transaction reverted",
            title: "Tx Error",
            position: "topR",
        });
        updateUI();
    };

    /*
    const listenForEvent = async function () {
        await new Promise(async (resolve, reject) => {
            console.log(provider);
            provider.once("WinnerPicked", async function () {
                console.log("WinnerPicked event detected");
                try {
                    setRecentWinner((await getRecentWinner()).toString());
                    console.log("New winner set correctly");
                } catch (e) {
                    reject(e);
                }
                resolve();
            });
        });
    };

    useEffect(() => {
        listenForEvent();
    });
    */

    return (
        <div className="p-5 ">
            <div>
                {addresses[chainId] == null ? (
                    <p>There's no contract deployed on this network</p>
                ) : (
                    <>
                        <p className="pb-5">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                                onClick={async () => {
                                    const tx = await enterRaffle({
                                        onSuccess: handleSuccess,
                                        onError: (error) => {
                                            console.log(error);
                                            handleError();
                                        },
                                    });
                                }}
                                disabled={isLoading || isFetching}
                            >
                                {isLoading || isFetching ? (
                                    <div className="animate-spin spinner-border h-8 border-b-2 rounded-full"></div>
                                ) : (
                                    "Enter Raffle"
                                )}
                            </button>
                        </p>
                        <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
                        <p>Number of players : {numberOfPlayers}</p>
                        <p>Last Winner : {recentWinner}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default LotteryEntrance;
