import { TxMsgs } from ".";

export class WjunoExtend {
    constructor(private txs: TxMsgs, private contract: string) {   
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