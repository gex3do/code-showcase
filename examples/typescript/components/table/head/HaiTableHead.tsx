import React, {FC} from 'react';
import {TableHead} from '@mui/material';
import {HaiTableHeadRow} from './HaiTableHeadRow';
import {HaiTableInstance} from '../index';

interface Props {
  table: HaiTableInstance;
}

export const HaiTableHead: FC<Props> = ({table}) => {
  const {
    getHeaderGroups,
    options: {muiTableHeadProps},
  } = table;

  return (
    <TableHead {...muiTableHeadProps}>
      {getHeaderGroups().map((headerGroup: any) => (
        <HaiTableHeadRow
          headerGroup={headerGroup as any}
          key={headerGroup.id}
          table={table}
        />
      ))}
    </TableHead>
  );
};
