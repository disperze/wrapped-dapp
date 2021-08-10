import { mdiAlphaWCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Component } from 'react';
import { Caption, Card, H5 } from 'ui-neumorphism';

interface IProps {
    amount?: number,
    symbol: string
}

interface IState {
}

export class BalanceCard extends Component<IProps, IState> {

    render() {
        const {amount, symbol} = this.props

        return ( 
            <Card
                dark
                elevation={3}
                style={{
                    display: 'flex',
                    width: '194px',
                    height: '194px',
                    borderRadius: '150px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: "center"
                }}
                className="ma-auto"
            >
                <Card flat>
                    <Icon path={mdiAlphaWCircle} size={2.5} color='var(--primary)' />
                    <H5 style={{ padding: '4px 0px' }}>{amount}</H5>
                    <Caption secondary>
                        {symbol}
                    </Caption>
                </Card>
            </Card>
        );
    }
}