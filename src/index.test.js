import 'core-js/es7/symbol';
import React from 'react';
import { createComponent } from './index';

it('exports createComponent method', () => {
  expect(typeof createComponent).toBe('function');
});
