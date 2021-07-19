import { Component } from 'react';

import {
    Card,
    TabItem,
    TabItems,
    Tab,
    Tabs,
    overrideThemeVariables,
    CardContent,
    H5,
    TextField,
    Fab,
    Caption,
    IconButton,
    Avatar,
} from 'ui-neumorphism';
import 'ui-neumorphism/dist/index.css';
import 'bootstrap-grid-only-css/dist/css/bootstrap-grid.min.css';
import { Icon } from '@mdi/react';
import { mdiChevronRight, mdiAlphaWCircle, mdiArrowDownBoldBox } from '@mdi/js';
import { CW20, Keplr, TxMsgs, Wjuno, WjunoExtend } from '../services';
import { CosmWasmFeeTable, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasLimits, defaultGasLimits as defaultStargateGasLimits } from '@cosmjs/stargate';
import Spacer from '../components/spacer';
import Notify from '../components/notify';

interface IProps {
}

interface IState {
    active?: number;
    wallet?: string;
    balance?: number;
    cw20balance?: number;
    connect: boolean;
    disableButtons: boolean;
    errorDValidation: string;
    errorWValidation: string;
    alertVisible: boolean;
    alertSuccess?: boolean;
    alertMessage?: any;
    loading: boolean;
    withdrawInput: number;
    withdrawControl: boolean;
    depositInput: number;
    depositControl: boolean;
}

class MainContainer extends Component<IProps, IState> {
    kep: Keplr = new Keplr;
    conn?: SigningCosmWasmClient;
    contrat: string = "juno1qglsnq9juk38325t02jfx44rg85jxsx4rg2xc8";
    cw20Contract: string = "juno18j6kr2f6l8yvn62wsu35mrwucxrq239d9ss9ry";
    depositAmount: number = 0;
    withdrawAmount: number = 0;
    private gasLimits: GasLimits<CosmWasmFeeTable>;
    
    constructor (props: IProps) {
        super(props);
        this.state = {
            active: 0,
            balance: 0,
            cw20balance: 0,
            connect: false,
            disableButtons: true,
            errorDValidation: "",
            errorWValidation: "",
            alertVisible: false,
            loading: false,
            withdrawInput: 0,
            withdrawControl: false,
            depositInput: 0,
            depositControl: false
        };
        overrideThemeVariables({
            '--light-bg': '#E4EBF5',
            '--light-bg-dark-shadow': '#bec8e4',
            '--light-bg-light-shadow': '#ffffff',
            '--dark-bg': '#1f2237',
            '--dark-bg-dark-shadow': '#11131e',
            '--dark-bg-light-shadow': '#353954',
            '--primary': '#15cc93',
            '--primary-dark': '#15cc93',
            '--primary-light': '#82b1ff'
        });
        this.gasLimits = {
            ...defaultStargateGasLimits,
            upload: 1_500_000,
            init: 500_000,
            migrate: 200_000,
            exec: 240_000,
            changeAdmin: 80_000,
        };
    }

  async connectWallet() {
      if (this.state.connect) {
          return;
      }
      
      const wallet = await this.kep.connect() as string;
      if (!wallet) {
          return;
      }
      
      this.setState({
        wallet: wallet,
        connect: true,
        disableButtons: false,
      });
      
      try {
        this.conn = await this.kep.getConnection(this.gasLimits);
        await this.updateBalance();
      } catch (error) {
        console.log(error);
        this.setAlertMessage(false, "Error: " + error);
      }
  }

  private async updateBalance() {
      const client = new CW20(this.conn!, this.cw20Contract);

      try {
          const cw20Result = await client.balance(this.state.wallet! as string)
          let balance = parseInt(cw20Result.balance) / Math.pow(10, 6);
          this.setState({
              cw20balance: balance,
          });
          const result = await this.conn?.getBalance(this.state.wallet!, "ujuno");
          balance = parseInt(result?.amount!) / Math.pow(10, 6);
          this.setState({
              balance: balance,
          });
      } catch (error) {
          console.log(error);
          this.setAlertMessage(false, "Error: " + error);
      }
  }

  async deposit() {
      if (this.depositAmount <= 0) {
          this.setState({
            errorDValidation: "Deposit amount required"
          });
          return;
      }

      if (this.depositAmount > this.state.balance!) {
        this.setState({
            errorDValidation: "Insuficient funds"
        });
        return;
      }

      this.setState({
          loading: true,
          disableButtons: true,
      });
      try {
        const client = new Wjuno(this.conn!, this.contrat);

        const deposit = this.depositAmount * Math.pow(10, 6);
        const result: any = await client.deposit(this.state.wallet!, {amount: deposit.toString(), denom: "ujuno"});
        this.setState({
            loading: false,
            disableButtons: false
        });
        if (result.code !== undefined &&
            result.code !== 0) {
            this.setAlertMessage(false, "Failed to send tx: " + result.log || result.rawLog);
            return;
        }

        this.setAlertMessage(true, "Successfull transaction: <a target='_blank' href='https://testnet.juno.aneka.io/txs/" + result.transactionHash + "'>" + result.transactionHash + "</a>");
        this.setInputDeposit(0);
        await this.updateBalance();
      } catch (error) {
        this.setState({
            loading: false,
            disableButtons: false
        });
        console.log(error);
        this.setAlertMessage(false, "Error: " + error);
      }
  }

  async withdraw() {
    if (this.withdrawAmount <= 0) {
        this.setState({
            errorWValidation: "Withdraw amount required"
        });
        return;
    }
    
    if (this.withdrawAmount > this.state.cw20balance!) {
        this.setState({
            errorWValidation: "Insuficient funds"
        });
        return;
    }

    this.setState({
        loading: true,
        disableButtons: true
    });
    try {
        const txs = new TxMsgs(this.conn!, this.gasLimits);
        const client = new WjunoExtend(txs, this.contrat);
    
        const withdraw = this.withdrawAmount * Math.pow(10, 6);
        const result: any = await client.withdrawFull(this.state.wallet!, this.cw20Contract, withdraw.toString());
        this.setState({
            loading: false,
            disableButtons: false
        });

        if (result.code !== undefined &&
            result.code !== 0) {
            this.setAlertMessage(false, "Failed to send tx: " + result.log || result.rawLog);
            return;
        }

        this.setAlertMessage(true, "Successfull transaction: <a target='_blank' href='https://testnet.juno.aneka.io/txs/" + result.transactionHash + "'>" + result.transactionHash + "</a>");
        this.setInputWithdraw(0);
        await this.updateBalance();
    } catch (error) {
        this.setState({
            loading: false,
            disableButtons: false
        });
        console.log(error);
        this.setAlertMessage(false, "Error: " + error);
    }
  }

  setDepositAmount(e: {value: string}) {
    this.setState({
        errorDValidation: ""
    });
    this.depositAmount = parseFloat(e.value || "0");
  }

  setWithdrawAmount(e: {value: string}) {
    this.setState({
        errorWValidation: ""
    });
    this.withdrawAmount = parseFloat(e.value || "0");
  }

  loadAllWithdrawAmount() {
      this.setInputWithdraw(this.state.cw20balance!);
  }

  setInputDeposit(value: number) {
    this.setState({
        depositControl: true,
        depositInput: value
    });
    this.depositAmount = value;
    
    setTimeout(() => {
      this.setState({
        depositControl: false
      });
    }, 100);
  }

  setInputWithdraw(value: number) {
    this.setState({
        withdrawControl: true,
        withdrawInput: value
    });
    this.withdrawAmount = value;
    
    setTimeout(() => {
      this.setState({
          withdrawControl: false
      });
    }, 100);
  }

  private getWalletMin(wallet: string): string {
      const first = wallet.substring(0, 10); 
      const last = wallet.substring(wallet.length - 8);

      return first+"..."+last;
  }

  private setAlertMessage(success: boolean, message: string) {
      const msg = <p dangerouslySetInnerHTML={{__html: message}}></p>
      this.setState({
          alertVisible: true,
          alertSuccess: success,
          alertMessage: msg
      });

      setTimeout(() => {
          this.setState({
              alertVisible: false
          });
      }, 5000);
  }

  render() {
    const { active } = this.state;

    const tabItems = (
      <TabItems value={active} >
        <TabItem>
        <Card dark inset style={{ padding: '16px' }}>
                    <Caption disabled secondary dark className="mb-3">
                        Available: {this.state.balance} JUNO
                    </Caption>
                    <TextField
                        label="Enter amount"
                        value={this.state.depositInput.toString()}
                        uncontrolled={this.state.depositControl}
                        onChange={this.setDepositAmount.bind(this)}
                        className="textfield"
                        style={{ margin: "0", width: "100%" }}
                        type='number'
                    ></TextField>
                    <Caption disabled secondary style={{color: "#ff5252", marginTop: "-12px", display: this.state.errorDValidation ? "block": "none"}}>
                        {this.state.errorDValidation}
                    </Caption>
                    <div className="text-center">
                        <IconButton
                            text={false}
                            dark
                            onClick={async () => await this.deposit()}
                            size='small'
                            disabled={this.state.disableButtons}
                            rounded
                        >
                            <Icon
                                path={mdiChevronRight}
                                size={0.7}
                                color='var(--primary)'
                            />
                        </IconButton>
                    </div>
                </Card>
        </TabItem>
        <TabItem>
        <Card dark inset style={{ padding: '16px' }}>
                    <div className="row">
                        <div className="col-md-10">
                            <Caption disabled secondary dark>
                                Available: {this.state.cw20balance} WJUNO
                            </Caption>
                        </div>
                        <div className="col-md-2" style={{display: "flex", justifyContent: "flex-end"}}>
                            <IconButton size='small' onClick={this.loadAllWithdrawAmount.bind(this)} style={{marginTop: "-3px"}}>
                                <Icon path={mdiArrowDownBoldBox} size={0.8} color='var(--primary)'/>
                            </IconButton>
                        </div>
                    </div>
                    <div>
                    </div>
                    <TextField
                        label="Enter amount"
                        value={this.state.withdrawInput.toString()}
                        onChange={this.setWithdrawAmount.bind(this)}
                        uncontrolled={this.state.withdrawControl}
                        className="textfield"
                        type='number'
                        style={{ margin: "0", width: "100%" }}
                    ></TextField>
                    <Caption disabled secondary style={{ color: "#ff5252", marginTop: "-12px", display: this.state.errorWValidation ? "block" : "none" }}>
                        {this.state.errorWValidation}
                    </Caption>
                    <div className="text-center">
                        <IconButton
                            text={false}
                            dark
                            onClick={async () => await this.withdraw()}
                            size='small'
                            disabled={this.state.disableButtons}
                            rounded
                        >
                            <Icon
                                path={mdiChevronRight}
                                size={0.7}
                                color='var(--primary)'
                            />
                        </IconButton>
                    </div>
                </Card>
        </TabItem>
      </TabItems>
    );

    let connectButton;
    if (this.state.connect) {
        connectButton = <p>&nbsp;<span style={{ fontSize: '16px' }}>&#128274;</span>&nbsp;{this.getWalletMin(this.state.wallet!)}&nbsp;</p>
    } else {
        connectButton = <p>&nbsp;<span style={{ fontSize: '16px' }}>&#128275;</span>&nbsp;CONNECT WALLET&nbsp;</p>
    }

    return (
        <main className={`theme--dark bootstrap-wrapper`}>
            <Avatar
                alt="Disperze Network"
                style={{float: "left", margin: "20px 0 0 30px"}}
                src="https://avatars.githubusercontent.com/u/71741453?s=120&v=4"></Avatar>
            <div style={{width: "100%", textAlign: "right"}}>
                <Fab dark color='var(--primary)' className="connect-btn"
                    style={{marginTop: "20px", marginRight: "30px"}}
                    onClick={async () => await this.connectWallet()}
                >
                    {connectButton}
                </Fab>
            </div>
            <div className="row" style={{margin: "80px 0"}}>
                <div className="col-md-7 ma-auto">
                    <Card dark className="pa-5" loading={this.state.loading}>
                    <CardContent>
                        <Spacer />
                        <div className="row">
                            <div className="col-md-6" style={{display: "flex"}}>
                                <Card
                                    dark
                                    elevation={3}
                                    style={{
                                        display: 'flex',
                                        width: '194px',
                                        height: '194px',
                                        borderRadius: '150px',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    className="ma-auto"
                                >
                                    <Card flat>
                                        <Icon path={mdiAlphaWCircle} size={2.5} color='var(--primary)' />
                                        <H5 style={{ padding: '4px 0px', textAlign: "center" }}>{this.state.cw20balance}</H5>

                                        <Caption secondary className="text-center">
                                            WJUNO
                                        </Caption>
                                    </Card>
                                </Card>
                            </div>
                            <div className="col-md-6">
                                <Card dark className="pa-5">
                                    <Tabs
                                        value={active}
                                        onChange={({ active }: { active: any }) => this.setState({ active })}
                                    >
                                        <Tab>Deposit</Tab>
                                        <Tab>Withdraw</Tab>
                                    </Tabs>
                                    {tabItems}
                                </Card>
                            </div>
                        </div>                        
                        <Spacer />
                    </CardContent>
                    </Card>
                </div>
            </div>
            <Notify
                visible={this.state.alertVisible}
                success={this.state.alertSuccess}>
                    {this.state.alertMessage}
            </Notify>
        </main>
    );
  }
}

export default MainContainer;