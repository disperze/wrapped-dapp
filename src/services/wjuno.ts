import { Coin } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export class Wjuno {
    constructor(
        private client: SigningCosmWasmClient,
        private contract: string,
    ) {
    }

    deposit(sender: string, amount: Coin) {
        const executMsg = {deposit: {}};

        return this.client.execute(sender, this.contract, executMsg, undefined, [amount]);
    }

    withdraw(sender: string, amount: string) {
        const executMsg = {withdraw: {amount: amount}};

        return this.client.execute(sender, this.contract, executMsg);
    }
}
