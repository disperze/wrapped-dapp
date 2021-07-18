import { Coin } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { TxMsgs } from "./tx-msgs";

export class Wjuno {
    constructor(
        private contract: string,
        private client: SigningCosmWasmClient,
        private txs?: TxMsgs
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

    async withdrawFull(sender: string, cw20Contrat: string, amount: string) {
        const increaseAllowance = {increase_allowance: {spender: this.contract, amount: amount}};
        const withdraw = {withdraw: {amount: amount}};
        const txs: TxMsgs = this.txs!;
        const allowanceMsg = txs.buildMsg(sender, cw20Contrat, increaseAllowance);
        const withdrawMsg = txs.buildMsg(sender, this.contract, withdraw);
        
        return txs.execute(sender, [allowanceMsg, withdrawMsg]);
    }
}
