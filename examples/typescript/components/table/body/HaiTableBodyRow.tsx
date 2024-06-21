import React, {FC, MouseEvent, useState} from 'react';
import {TableRow} from '@mui/material';
import {Row} from '@tanstack/react-table';
import {DOUBLE_CLICK_DELAY, MouseClickState} from '../../../types/mouse';
import {HaiTableBodyCell} from './HaiTableBodyCell';

import {HaiTableInstance} from '../index';

interface HaiTableBodyRowProps<TData extends Record<string, any>> {
  row: Row<TData>;
  rowIndex: number;
  table: HaiTableInstance;
}

// This variable should stay global (outside the functional component), because
// when the component re-renders, this variable resets, and the current mouse state is lost.
// Also, this variable cannot be present as a component state, because
// changing state force component re-rendering, and we do not need that
// for this situation
let clickState: MouseClickState = MouseClickState.NONE;

export const HaiTableBodyRow: FC<HaiTableBodyRowProps<any>> = ({
  row,
  rowIndex,
  table,
}) => {
  const {
    options: {muiTableBodyRowProps},
    handlers: {onRowDoubleClick, onRowClick, onRowHover, onRowLeave},
  } = table;

  const rowData = row.original;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isHovered, setHover] = useState<boolean>(false);

  let doubleClickTimer: NodeJS.Timeout | undefined;

  const onDoubleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    clickState = MouseClickState.DOUBLE;
    clearTimeout(doubleClickTimer);
    onRowDoubleClick(event, rowData);
  };

  const onClick = (event: MouseEvent<HTMLTableCellElement>) => {
    clickState = MouseClickState.SINGLE;

    doubleClickTimer = setTimeout(() => {
      if (clickState === MouseClickState.SINGLE) {
        onRowClick(event, rowData);
      }

      clickState = MouseClickState.NONE;
    }, DOUBLE_CLICK_DELAY);
  };

  const onHover = (event: MouseEvent<HTMLTableCellElement>) => {
    setHover(true);
    onRowHover(event, rowData);
  };

  const onLeave = (event: MouseEvent<HTMLTableCellElement>) => {
    setHover(false);
    onRowLeave(event, rowData);
  };

  return (
    <TableRow
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseOut={onLeave}
      key={rowIndex}
      {...muiTableBodyRowProps}
      sx={{
        lineHeight: '40px',
        ...(muiTableBodyRowProps?.sx as any),
      }}
    >
      {row?.getVisibleCells()?.map?.(cell => (
        <HaiTableBodyCell cell={cell} key={cell.id} table={table} />
      ))}
    </TableRow>
  );
};
