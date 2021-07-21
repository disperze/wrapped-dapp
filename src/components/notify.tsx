import { mdiAlert, mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { Component } from 'react';
import { Alert } from 'ui-neumorphism';

interface IProps {
    success?: boolean
    visible?: boolean
    children?: any
}

interface IState {
}

class Notify extends Component<IProps, IState> {

    render() {
        const {visible, children, success} = this.props

        return ( 
            visible ? <Alert
                type={success ? 'success': 'error'}
                style={{ position: 'absolute', bottom: "16px", right: "16px", maxWidth: "640px" }}
                dark
                border='left'
                icon={<Icon path={success ? mdiCheck : mdiAlert} size={1} />}
            >{children}</Alert>
            : null
        );
    }
}

export default Notify;