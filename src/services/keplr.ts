import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export class Keplr {
    
    async getConnection(node: string): Promise<SigningCosmWasmClient> {
        const chainId = "uni";

        const w = (window as any);
        await w.keplr.enable(chainId);
    
        const offlineSigner = w.getOfflineSigner(chainId);

        return SigningCosmWasmClient.connectWithSigner(
            node,
            offlineSigner
        );
    }

    async connect(): Promise<[boolean, string]> {
        const error = await this.registerChain();
        if (error) {
            return [false, error];
        }
        const chainId = "uni";

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
            return [false, `${error}`];
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
                        chainId: "uni",
                        chainName: "Juno Testnet",
                        rpc: "https://rpc.juno.giansalex.dev:443",
                        rest: "https://lcd.juno.giansalex.dev:443",
                        stakeCurrency: {
                            coinDenom: "JUNOX",
                            coinMinimalDenom: "ujunox",
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
                            coinDenom: "JUNOX",
                            coinMinimalDenom: "ujunox",
                            coinDecimals: 6,
                            // coinGeckoId: ""
                        }],
                        feeCurrencies: [{
                            coinDenom: "JUNOX",
                            coinMinimalDenom: "ujunox",
                            coinDecimals: 6,
                            // coinGeckoId: ""
                        }],
                        gasPriceStep: {
                            low: 0.001,
                            average: 0.002,
                            high: 0.004
                        },
                        features: ["stargate", 'ibc-transfer', 'cosmwasm', 'no-legacy-stdTx'],
                        explorerUrlToTx: 'https://blueprints.juno.giansalex.dev/#/transactions/{txHash}',
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
