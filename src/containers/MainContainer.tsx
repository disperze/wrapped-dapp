import { Component } from 'react';

import {
    Card,
    TabItem,
    TabItems,
    Tab,
    Tabs,
    overrideThemeVariables,
    CardContent,
    TextField,
    Fab,
    Caption,
    IconButton,
    Avatar,
} from 'ui-neumorphism';
import 'ui-neumorphism/dist/index.css';
import 'bootstrap-grid-only-css/dist/css/bootstrap-grid.min.css';
import { Icon } from '@mdi/react';
import { mdiChevronRight, mdiArrowDownBoldBox } from '@mdi/js';
import { CW20, Keplr, Wjuno } from '../services';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import Spacer from '../components/spacer';
import Notify from '../components/notify';
import { settings } from '../settings';
import { BalanceCard } from '../components/BalanceCard';
import { TokenInfo } from '../services/cw20-balance';

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
    kep: Keplr = new Keplr();
    conn?: SigningCosmWasmClient;
    contract: string = settings.ContractAddress;
    tokenInfo: TokenInfo;
    nativeCoin: string = "ujunox";
    depositAmount: number = 0;
    withdrawAmount: number = 0;
    
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
        this.tokenInfo = {
            name: "Wrapped JUNO",
            symbol: "WJUNO",
            decimals: 6
        };
    }

    private handleChangeKeplr = async () => {
        this.setState({
            connect: false,
        });
        await this.connectWallet();
    };

    componentDidMount() {
        window.addEventListener('keplr_keystorechange', this.handleChangeKeplr);
        setTimeout(async () => {
            await this.connectWallet();
        }, 200);
    }

    componentWillUnmount() {
        window.removeEventListener('keplr_keystorechange', this.handleChangeKeplr);
    }

    async connectWallet() {
      if (this.state.connect) {
          return;
      }
      
      const [success, result] = await this.kep.connect();

      if (!success) {
          this.setAlertMessage(false, result);
          return;
      }
      
      this.setState({
        wallet: result,
        connect: true,
        disableButtons: false,
      });
      
      try {
        this.conn = await this.kep.getConnection(settings.NodeUrl);
        const client = new CW20(this.conn!, this.contract);
        this.tokenInfo = await client.tokenInfo();
        await this.updateBalance();
      } catch (error) {
        console.log(error);
        this.setAlertMessage(false, `${error}`);
      }
    }

  private async updateBalance() {
      const client = new CW20(this.conn!, this.contract);

      try {
          const cw20Result = await client.balance(this.state.wallet! as string)
          let balance = parseInt(cw20Result.balance) / Math.pow(10, 6);
          this.setState({
              cw20balance: balance,
          });
          const result = await this.conn?.getBalance(this.state.wallet!, this.nativeCoin);
          balance = parseInt(result?.amount!) / Math.pow(10, 6);
          this.setState({
              balance: balance,
          });
      } catch (error) {
          console.log(error);
          this.setAlertMessage(false, `${error}`);
      }
  }

  async deposit() {
      if (this.depositAmount <= 0) {
          this.setState({
            errorDValidation: "Amount is required"
          });
          return;
      }

      if (this.depositAmount > this.state.balance!) {
        this.setState({
            errorDValidation: "Insufficient funds"
        });
        return;
      }

      this.setState({
          loading: true,
          disableButtons: true,
      });
      try {
        const client = new Wjuno(this.conn!, this.contract);

        const deposit = Math.floor(this.depositAmount * Math.pow(10, 6));
        const result: any = await client.deposit(this.state.wallet!, {amount: deposit.toString(), denom: this.nativeCoin});
        this.setState({
            loading: false,
            disableButtons: false
        });
        if (result.code !== undefined &&
            result.code !== 0) {
            this.setAlertMessage(false, "Failed to send tx: " + result.log || result.rawLog);
            return;
        }

        this.setAlertMessage(true, this.getTxSuccessMessage(result.transactionHash));
        this.setInputDeposit(0);
        await this.updateBalance();
      } catch (error) {
        this.setState({
            loading: false,
            disableButtons: false
        });
        console.log(error);
        this.setAlertMessage(false, `${error}`);
      }
  }

  async withdraw() {
    if (this.withdrawAmount <= 0) {
        this.setState({
            errorWValidation: "Amount is required"
        });
        return;
    }
    
    if (this.withdrawAmount > this.state.cw20balance!) {
        this.setState({
            errorWValidation: "Insufficient funds"
        });
        return;
    }

    this.setState({
        loading: true,
        disableButtons: true
    });
    try {
        const client = new Wjuno(this.conn!, this.contract);
    
        const withdraw = Math.floor(this.withdrawAmount * Math.pow(10, 6));
        const result: any = await client.withdraw(this.state.wallet!, withdraw.toString());
        this.setState({
            loading: false,
            disableButtons: false
        });

        if (result.code !== undefined &&
            result.code !== 0) {
            this.setAlertMessage(false, "Failed to send tx: " + result.log || result.rawLog);
            return;
        }

        this.setAlertMessage(true, this.getTxSuccessMessage(result.transactionHash));
        this.setInputWithdraw(0);
        await this.updateBalance();
    } catch (error) {
        this.setState({
            loading: false,
            disableButtons: false
        });
        console.log(error);
        this.setAlertMessage(false, `${error}`);
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
        withdrawInput: value,
        errorWValidation: ""
    });
    this.withdrawAmount = value;
    
    setTimeout(() => {
      this.setState({
          withdrawControl: false
      });
    }, 100);
  }

  private getTxSuccessMessage(tx: string): string {
    return "Transaction successful <br><a target='_blank' href='https://blueprints.juno.giansalex.dev/#/transactions/" + tx + "'>View explorer</a>";
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
                        Available: {this.state.balance} JUNOX
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
                                Available: {this.state.cw20balance} {this.tokenInfo.symbol}
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
                                <BalanceCard amount={this.state.cw20balance} symbol={this.tokenInfo.symbol} />
                            </div>
                            <div className="col-md-6 mobile-pacer">
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