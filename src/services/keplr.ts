import { CosmWasmFeeTable, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasLimits } from "@cosmjs/stargate"

export class Keplr {
    
    async getConnection(gasLimits: GasLimits<CosmWasmFeeTable>): Promise<SigningCosmWasmClient> {
        const chainId = "lucina";

        const w = (window as any);
        await w.keplr.enable(chainId);
    
        const offlineSigner = w.getOfflineSigner(chainId);

        return SigningCosmWasmClient.connectWithSigner(
            "https://rpc.juno.giansalex.dev:443",
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
                    // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                    // If the user approves, the chain will be added to the user's Keplr extension.
                    // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                    // If the same chain id is already registered, it will resolve and not require the user interactions.
                    await w.keplr.experimentalSuggestChain({
                        // Chain-id of the Cosmos SDK chain.
                        chainId: "lucina",
                        // The name of the chain to be displayed to the user.
                        chainName: "Juno testnet",
                        // RPC endpoint of the chain.
                        rpc: "https://rpc.juno.giansalex.dev:443",
                        // REST endpoint of the chain.
                        rest: "https://lcd.juno.giansalex.dev:443",
                        // Staking coin information
                        // (Currently, Keplr doesn't have the UI that shows multiple tokens, therefore this uses the SHELL token as the primary token althought SHELL is not a staking coin.)
                        stakeCurrency: {
                            // Coin denomination to be displayed to the user.
                            coinDenom: "JUNO",
                            // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                            coinMinimalDenom: "ujuno",
                            // # of decimal points to convert minimal denomination to user-facing denomination.
                            coinDecimals: 6,
                            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                            // coinGeckoId: ""
                        },
                        // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
                        // The 'stake' button in Keplr extension will link to the webpage.
                        // walletUrlForStaking: "",
                        // The BIP44 path.
                        bip44: {
                            // You can only set the coin type of BIP44.
                            // 'Purpose' is fixed to 44.
                            coinType: 118,
                        },
                        // Bech32 configuration to show the address to user.
                        bech32Config: {
                            bech32PrefixAccAddr: "juno",
                            bech32PrefixAccPub: "junopub",
                            bech32PrefixValAddr: "junovaloper",
                            bech32PrefixValPub: "junovaloperpub",
                            bech32PrefixConsAddr: "junovalcons",
                            bech32PrefixConsPub: "junovalconspub"
                        },
                        // List of all coin/tokens used in this chain.
                        currencies: [{
                            // Coin denomination to be displayed to the user.
                            coinDenom: "JUNO",
                            // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                            coinMinimalDenom: "ujuno",
                            // # of decimal points to convert minimal denomination to user-facing denomination.
                            coinDecimals: 6,
                            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                            // coinGeckoId: ""
                        }],
                        // List of coin/tokens used as a fee token in this chain.
                        feeCurrencies: [{
                            // Coin denomination to be displayed to the user.
                            coinDenom: "JUNO",
                            // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                            coinMinimalDenom: "ujuno",
                            // # of decimal points to convert minimal denomination to user-facing denomination.
                            coinDecimals: 6,
                            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                            // coinGeckoId: ""
                        }],
                        // (Optional) The number of the coin type.
                        // This field is only used to fetch the address from ENS.
                        // Ideally, it is recommended to be the same with BIP44 path's coin type.
                        // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
                        // So, this is separated to support such chains.
                        // coinType: 118,
                        // (Optional) This is used to set the fee of the transaction.
                        // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
                        // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
                        // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
                        gasPriceStep: {
                            low: 0.01,
                            average: 0.025,
                            high: 0.04
                        },
                        features: ["stargate"]
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
