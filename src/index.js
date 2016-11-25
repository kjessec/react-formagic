import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Census from './Census';

import store from './store';
import { Provider } from 'react-redux';

ReactDOM.render(
  <Provider store={store}>
    <Census/>
  </Provider>,
  document.getElementById('root')
);
