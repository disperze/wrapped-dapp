import { CosmWasmFeeTable, defaultGasLimits, ExecuteResult, MsgExecuteContractEncodeObject, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { toUtf8 } from "@cosmjs/encoding";
import { defaultGasPrice, Coin, buildFeeTable, isBroadcastTxFailure, BroadcastTxFailure, logs, GasLimits } from "@cosmjs/stargate";
import { EncodeObject } from "@cosmjs/proto-signing";

export class TxMsgs {
    constructor(private client: SigningCosmWasmClient, private gasLimit: GasLimits<CosmWasmFeeTable>) {
    }

    async execute(
        senderAddress: string,
        msgs: EncodeObject[],
        memo = "",
    ): Promise<ExecuteResult> {
        const fees = buildFeeTable<CosmWasmFeeTable>(defaultGasPrice, this.gasLimit, {});

        const result = await this.client.signAndBroadcast(senderAddress, msgs, fees.exec, memo);
        if (isBroadcastTxFailure(result)) {
          throw new Error(this.createBroadcastTxErrorMessage(result));
        }
        return {
          logs: logs.parseRawLog(result.rawLog),
          transactionHash: result.transactionHash,
        };
    }

    buildMsg(sender: string, contract: string, msg: Record<string, unknown>, funds?: readonly Coin[]): EncodeObject {
        const executeContractMsg: MsgExecuteContractEncodeObject = {
            typeUrl: "/cosmwasm.wasm.v1beta1.MsgExecuteContract",
            value: {
                sender: sender,
                contract: contract,
                msg: toUtf8(JSON.stringify(msg)),
                funds: [...(funds || [])],
            },
          };
        
        return executeContractMsg;
    }

    private createBroadcastTxErrorMessage(result: BroadcastTxFailure): string {
        return `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`;
    }
}