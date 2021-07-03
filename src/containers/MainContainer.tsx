import React, { Component } from 'react';

import {
    Card,
    Divider,
    overrideThemeVariables
} from 'ui-neumorphism';
import 'ui-neumorphism/dist/index.css'

class MainContainer extends Component {
    constructor (props: {} | Readonly<{}>) {
        super(props);
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
  render() {
    return (
        <main className={`theme--light`}>
            
        </main>
    );
  }
}

export default MainContainer;