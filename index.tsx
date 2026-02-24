import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './app.tsx';

import themes from 'devextreme/ui/themes';
themes.initialized(() => ReactDOM.render(
  <App />,
  document.getElementById('app'),
));  



