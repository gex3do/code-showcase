import React, {FC, MouseEvent} from 'react';

import {TableCell} from '@mui/material';

import {DOUBLE_CLICK_DELAY, MouseClickState} from '../../../types/mouse';
import {ColumnDefType} from '../libs/rowsAndColumns';
import {HaiTableBodyCellProps} from './HaiTableBodyCell';

interface OutreasonTableBodyCellProps extends HaiTableBodyCellProps {
  textColor: string;
}

// NOTE: This variable should stay global (outside the functional component), because
//  when the component re-renders, this variable resets, and the current mouse state is lost.
//  Also, this variable cannot be present as a component state, because
//  changing state force component re-rendering, and we do not need that
//  for this situation
let clickState: MouseClickState = MouseClickState.NONE;

export const OutreasonTableBodyCell: FC<OutreasonTableBodyCellProps> = ({
  cell,
  table,
  textColor,
}) => {
  const {
    options: {muiTableBodyCellProps},
    handlers: {onCellDoubleClick, onCellClick, onCellHover, onCellLeave},
  } = table;

  const {column, row} = cell;
  const {columnDef} = column;
  const {
    meta: {columnDefType},
  } = columnDef;
  const rowData = row.original;

  let doubleClickTimer: NodeJS.Timeout | undefined;

  const onDoubleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    clickState = MouseClickState.DOUBLE;
    clearTimeout(doubleClickTimer);

    onCellDoubleClick(event, rowData);
  };

  const onClick = (event: MouseEvent<HTMLTableCellElement>) => {
    clickState = MouseClickState.SINGLE;

    doubleClickTimer = setTimeout(() => {
      if (clickState === MouseClickState.SINGLE) {
        if (columnDefType !== ColumnDefType.display) {
          onCellClick(event, rowData);
        }
      }
      clickState = MouseClickState.NONE;
    }, DOUBLE_CLICK_DELAY);
  };

  const onHover = (event: MouseEvent<HTMLTableCellElement>) => {
    onCellHover(event, rowData);
  };

  const onLeave = (event: MouseEvent<HTMLTableCellElement>) => {
    onCellLeave(event, rowData);
  };

  return (
    <TableCell
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseOut={onLeave}
      {...muiTableBodyCellProps}
      sx={() => ({
        overflow: 'hidden',
        position: 'relative',
        whiteSpace: 'nowrap',
        ...(muiTableBodyCellProps?.sx as any),
        width:
          columnDefType === ColumnDefType.display ? '16px' : column.getSize(),
        color: textColor ?? undefined,
      })}
    >
      {/* FIXME: use a cell renderer that can handle values for different entity types
          (move the renderer from rowsAndColumns.tsx here - or to another suitable location */}
      {columnDefType === ColumnDefType.display
        ? columnDef.cell?.({cell, column, table})
        : columnDef?.cell?.({cell, column, table}) ?? cell.renderValue()}
    </TableCell>
  );
};
