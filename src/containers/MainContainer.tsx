import React, { Component } from 'react';

import {
    Card,
    Divider,
    TabItem,
    TabItems,
    Tab,
    Tabs,
    overrideThemeVariables,
    CardContent,
    Subtitle2,
    H5,
    Body2,
    CardAction,
    Button,
    TextField,
    Fab,
    Caption,
    IconButton,
    ToggleButton
} from 'ui-neumorphism';
import 'ui-neumorphism/dist/index.css';
import 'bootstrap-grid-only-css/dist/css/bootstrap-grid.min.css';
import { Icon } from '@mdi/react';
import { mdiTicket, mdiRun, mdiChevronRight, mdiFormatBold } from '@mdi/js';
import Keplr from '../services/keplr';

interface IProps {
}

interface IState {
    active?: number;
}

class MainContainer extends Component<IProps, IState> {
    kep: Keplr = new Keplr;
    
    constructor (props: IProps) {
        super(props);
        this.state = {
            active: 0
        };
        overrideThemeVariables({
            '--light-bg': '#E4EBF5',
            '--light-bg-dark-shadow': '#bec8e4',
            '--light-bg-light-shadow': '#ffffff',
            '--dark-bg': '#444444',
            '--dark-bg-dark-shadow': '#363636',
            '--dark-bg-light-shadow': '#525252',
            '--primary': '#2979ff',
            '--primary-dark': '#2962ff',
            '--primary-light': '#82b1ff'
        });
    }

  connectWallet() {
      this.kep.connect()
      .then(address => alert(address));
  }
  render() {
    const { active } = this.state;

    const tabItems = (
      <TabItems value={active} >
        <TabItem>
            <Card dark inset className="pa-5">
                <CardContent>
                <div className="row">
                    <div className="col-md-6">
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
                                <Icon path={mdiRun} size={2.5} color='var(--primary)' />
                                <H5 style={{ padding: '4px 0px' }}>8,690</H5>

                                <Caption secondary className="text-center">
                                    WJUNO
                                </Caption>
                            </Card>
                        </Card>
                    </div>
                    <div className="col-md-6">
                    <Card dark rounded={false} elevation={2} style={{ padding: '16px', marginTop: "30px" }}>
                                <Caption disabled secondary className="mb-3" style={{marginLeft: "12px"}}>
                                    Available: 200 JUNO 
                                </Caption>
                        <TextField
                            label="Enter amount"
                        ></TextField>
                                        <div className="text-right">
                                        <IconButton
                                            text={false}
                                            dark
                                            size='small'
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
                    </div>
                </div>
                </CardContent>
            </Card>
        </TabItem>
        <TabItem>
        <Card dark inset>
            <CardContent>
                <div>
                    Balance: 100 <code>WJUNO</code>
                </div>
                <TextField
                    append='WJUNO'
                    label='Enter amount'
                    className='my-3'
                ></TextField>
            </CardContent>
            <CardAction>
                <Button dark depressed>
                    Withdraw
                </Button>
            </CardAction>
        </Card>
        </TabItem>
      </TabItems>
    );

    return (
        <main className={`theme--dark bootstrap-wrapper`}>
            <div style={{width: "100%", textAlign: "right"}}>
                <Fab dark color='var(--primary)' style={{marginTop: "20px", marginRight: "30px"}}
                    onClick={() => this.connectWallet()}
                >
                    &nbsp;<span style={{ fontSize: '24px' }}>&#9729;</span>&nbsp;Connect wallet&nbsp;
                </Fab>
            </div>
            <div className="row">
                <div className="col-md-6 ma-auto">
                    <Card dark className="ma-3 pa-5">
                        <Tabs
                        value={active}
                        onChange={({ active }: { active: any}) => this.setState({ active })}
                        >
                        <Tab>Deposit</Tab>
                        <Tab>Withdraw</Tab>
                        </Tabs>
                        {tabItems}
                    </Card>
                </div>
            </div>
        </main>
    );
  }
}

export default MainContainer;