import React, { Component } from 'react';
import './App.css';
import PaperView from './PaperView';

import './Button.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h2>Factorio Designer</h2>
        <PaperView />
      </div>
    );
  }
}

export default App;
