import React, {FC, useMemo} from 'react';

import {TableBody} from '@mui/material';

import {CertTableBodyRow} from './CertTableBodyRow';
import {CertTableInstance} from '..';

interface CertTableBodyProps {
  table: CertTableInstance;
}

export const CertTableBody: FC<CertTableBodyProps> = ({table}) => {
  const {
    getRowModel,
    getPrePaginationRowModel,
    getState,
    options: {enablePagination, muiTableBodyProps},
  } = table;

  const {
    globalFilter,
    pagination: {pageSize},
  } = getState();

  const rows = useMemo(() => {
    return enablePagination
      ? getRowModel().rows
      : getPrePaginationRowModel().rows;
  }, [
    globalFilter || !enablePagination
      ? getPrePaginationRowModel().rows
      : getRowModel().rows,
    globalFilter,
  ]);

  let paddingBottom = 0;
  const rowHeight = 36.5; // FIXME: This is hardcoded and thus needs review whenever the styling changes
  if (enablePagination) {
    paddingBottom = (pageSize - rows.length) * rowHeight;
  }

  return (
    <TableBody sx={{tableLayout: 'fixed'}} {...muiTableBodyProps}>
      {rows.map((row: any, rowIndex: number) => (
        <CertTableBodyRow
          key={row.id}
          row={row}
          rowIndex={rowIndex}
          table={table}
        />
      ))}
      {paddingBottom > 0 && (
        <tr>
          <td style={{height: `${paddingBottom}px`}} />
        </tr>
      )}
    </TableBody>
  );
};
