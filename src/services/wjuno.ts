import { calculateFee, Coin, StdFee } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export class Wjuno {
    readonly fee: StdFee;
    constructor(
        private client: SigningCosmWasmClient,
        private contract: string,
    ) {
        this.fee = calculateFee(140000, "0.025ucosm");
    }

    deposit(sender: string, amount: Coin) {
        const executMsg = {deposit: {}};

        return this.client.execute(sender, this.contract, executMsg, this.fee, undefined, [amount]);
    }

    withdraw(sender: string, amount: string) {
        const executMsg = {withdraw: {amount: amount}};

        return this.client.execute(sender, this.contract, executMsg, this.fee);
    }
}
