import React, {FC} from 'react';
import {alpha, lighten, TableRow} from '@mui/material';
import {HaiTableHeadCell} from './HaiTableHeadCell';
import {HeaderGroup} from '@tanstack/react-table';
import {HaiTableInstance} from '../index';

interface Props<TData extends Record<string, any>> {
  headerGroup: HeaderGroup<TData>;
  table: HaiTableInstance;
}

export const HaiTableHeadRow: FC<Props<any>> = ({headerGroup, table}) => {
  const {
    options: {muiTableHeadRowProps},
  } = table;

  return (
    <TableRow
      {...muiTableHeadRowProps}
      sx={theme => ({
        boxShadow: `4px 0 8px ${alpha(theme.palette.common.black, 0.1)}`,
        backgroundColor: lighten(theme.palette.background.default, 0.04),
        ...(muiTableHeadRowProps?.sx as any),
      })}
    >
      {headerGroup.headers.map((headerCell: any, index: number) => (
        <HaiTableHeadCell
          key={headerCell.id || index}
          header={headerCell}
          table={table}
        />
      ))}
    </TableRow>
  );
};
