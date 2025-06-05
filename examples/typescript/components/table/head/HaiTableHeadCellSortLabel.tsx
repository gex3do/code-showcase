import React, {FC} from 'react';
import {TableSortLabel} from '@mui/material';
import {Header} from '@tanstack/react-table';

interface Props {
  header: Header<any, any>;
}

export const HaiTableHeadCellSortLabel: FC<Props> = ({header}) => {
  const {column} = header;

  return (
    <TableSortLabel
      active={!!column.getIsSorted()}
      direction={
        column.getIsSorted()
          ? (column.getIsSorted() as 'asc' | 'desc')
          : undefined
      }
      sx={{
        width: '2ch',
        transform: 'translateX(-0.5ch)',
      }}
    />
  );
};
