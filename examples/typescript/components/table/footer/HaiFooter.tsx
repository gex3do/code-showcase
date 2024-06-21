import {flexRender} from '@tanstack/react-table';
import React, {FC} from 'react';
import {HaiTableInstance} from '../index';

interface Props {
  table: HaiTableInstance;
}

export const HaiTableFooter: FC<Props> = ({table}) => {
  return (
    <tfoot>
      {table.getFooterGroups().map(footerGroup => (
        <tr key={footerGroup.id}>
          {footerGroup.headers.map(header => (
            <th key={header.id}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.footer,
                    header.getContext()
                  )}
            </th>
          ))}
        </tr>
      ))}
    </tfoot>
  );
};
