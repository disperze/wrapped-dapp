import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw20Balance, TokenInfo } from "./cw20-balance";

export class CW20 {
    constructor(private client: SigningCosmWasmClient, private contract: string) {
    }

    balance(address: string): Promise<Cw20Balance> {
        const queryMsg = {balance: {address: address}};

        return this.client.queryContractSmart(this.contract, queryMsg);
    }

    tokenInfo(): Promise<TokenInfo> {
        const queryMsg = {token_info: {}};

        return this.client.queryContractSmart(this.contract, queryMsg);
    }
}