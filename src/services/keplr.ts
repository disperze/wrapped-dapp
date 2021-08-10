import { CosmWasmFeeTable, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasLimits } from "@cosmjs/stargate"

export class Keplr {
    
    async getConnection(node: string, gasLimits: GasLimits<CosmWasmFeeTable>): Promise<SigningCosmWasmClient> {
        const chainId = "lucina";

        const w = (window as any);
        await w.keplr.enable(chainId);
    
        const offlineSigner = w.getOfflineSigner(chainId);

        return SigningCosmWasmClient.connectWithSigner(
            node,
            offlineSigner,
            {
                gasLimits: gasLimits
            }
        );
    }

    async connect(): Promise<[boolean, string]> {
        const error = await this.registerChain();
        if (error) {
            return [false, error];
        }
        const chainId = "lucina";

        const w = (window as any);
        try {
            await w.keplr.enable(chainId);
    
            const offlineSigner = w.getOfflineSigner(chainId);
        
            // You can get the address/public keys by `getAccounts` method.
            // It can return the array of address/public key.
            // But, currently, Keplr extension manages only one address/public key pair.
            // XXX: This line is needed to set the sender address for SigningCosmosClient.
            const accounts = await offlineSigner.getAccounts();
        
            return [true, accounts[0].address];
        } catch (error) {
            return [false, error];
        }
    }

    async registerChain(): Promise<string> {
        const w = (window as any);
        if (!w.getOfflineSigner || !w.keplr) {
            return "Please install keplr extension";
        } else {
            if (w.keplr.experimentalSuggestChain) {
                try {
                    await w.keplr.experimentalSuggestChain({
                        chainId: "lucina",
                        chainName: "Juno testnet",
                        rpc: "https://rpc.juno.giansalex.dev:443",
                        rest: "https://lcd.juno.giansalex.dev:443",
                        stakeCurrency: {
                            coinDenom: "JUNO",
                            coinMinimalDenom: "ujuno",
                            coinDecimals: 6,
                            // coinGeckoId: ""
                        },
                        // walletUrlForStaking: "",
                        bip44: {
                            coinType: 118,
                        },
                        bech32Config: {
                            bech32PrefixAccAddr: "juno",
                            bech32PrefixAccPub: "junopub",
                            bech32PrefixValAddr: "junovaloper",
                            bech32PrefixValPub: "junovaloperpub",
                            bech32PrefixConsAddr: "junovalcons",
                            bech32PrefixConsPub: "junovalconspub"
                        },
                        currencies: [{
                            coinDenom: "JUNO",
                            coinMinimalDenom: "ujuno",
                            coinDecimals: 6,
                            // coinGeckoId: ""
                        }],
                        feeCurrencies: [{
                            coinDenom: "JUNO",
                            coinMinimalDenom: "ujuno",
                            coinDecimals: 6,
                            // coinGeckoId: ""
                        }],
                        gasPriceStep: {
                            low: 0.01,
                            average: 0.025,
                            high: 0.04
                        },
                        features: ["stargate", 'ibc-transfer', 'cosmwasm'],
                        explorerUrlToTx: 'https://testnet.juno.aneka.io/txs/{txHash}',
                    });
    
                    return "";
                } catch {
                    return "Failed to suggest the chain";
                }
            } else {
                return "Please use the recent version of keplr extension";
            }
        }
    }
}
