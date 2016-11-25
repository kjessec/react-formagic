import { connect } from 'react-redux';
import formagic from 'react-formagic';

import Census from './Census';
const identity = x => x;

export default connect(
  identity
)(formagic(
  identity,
  (newState, { dispatch }) => dispatch({ type: 'UPDATE', data: newState })
)(Census));
