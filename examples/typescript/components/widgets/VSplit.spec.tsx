import React from 'react';
import {screen} from '@testing-library/react';
import {renderWithRedux} from '../../test/renderWithRedux';
import {VSplit} from './VSplit';

describe('The VSplit', () => {
  it.each([
    [[{width: 12, data: []}], 1],
    [
      [
        {width: 4, data: []},
        {width: 8, data: []},
      ],
      2,
    ],
  ])('Grid column rendering and it`s width | %o', (props, expectedColQty) => {
    renderWithRedux(<VSplit {...props} />);

    // Check if all columns are generated, and each grid column has proper `md` attribute
    for (let i = 0; i < expectedColQty; i++) {
      const colEl = screen.getByTestId(`vsplit-column-${i}`);
      expect(colEl).toBeInTheDocument();
      expect(colEl.outerHTML).toContain(`MuiGrid-grid-md-${props[i].width}`);
    }
  });
});
