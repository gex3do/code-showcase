import React, {FC, ReactNode} from 'react';
import {Box, TableCell} from '@mui/material';
import {HaiTableHeadCellSortLabel} from './HaiTableHeadCellSortLabel';
import {ColumnDefType} from '../libs/rowsAndColumns';
import {HaiTableInstance} from '../index';

interface Props {
  header: any; // TODO provide more specific type
  table: HaiTableInstance;
}

export const HaiTableHeadCell: FC<Props> = ({header, table}) => {
  const {
    options: {enableMultiSort, muiTableHeadCellProps},
  } = table;

  const {column} = header;
  const {columnDef, getCanSort, getSize} = column;
  const colCanSort = getCanSort();
  const colSize = getSize();
  const {
    meta: {columnDefType},
  } = columnDef;

  const headerElement = ((columnDef?.header instanceof Function
    ? columnDef?.header?.({
        column,
        header,
        table,
      })
    : columnDef?.header) ?? columnDef.header) as ReactNode;

  const tableHeadCellRef = React.useRef<HTMLTableCellElement>(null);

  return (
    <TableCell
      align={'left'}
      colSpan={header.colSpan}
      ref={tableHeadCellRef}
      {...muiTableHeadCellProps}
      sx={{
        fontWeight: 'bold',
        overflow: 'visible',
        p: '2px',
        userSelect: enableMultiSort && colCanSort ? 'none' : undefined,
        verticalAlign: 'middle',
        zIndex: 1,
        ...(muiTableHeadCellProps?.sx as any),
        maxWidth: `min(${colSize}px, fit-content)`,
        minWidth: `max(${colSize}px, ${columnDef.minSize ?? 30}px)`,
        width: columnDefType === ColumnDefType.display ? '16px' : colSize,
      }}
    >
      {!header.isPlaceholder && (
        <Box
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            justifyContent:
              muiTableHeadCellProps?.align === 'right'
                ? 'flex-end'
                : columnDefType === 'group' ||
                  muiTableHeadCellProps?.align === 'center'
                ? 'center'
                : 'space-between',
            position: 'relative',
            width: '100%',
          }}
        >
          <Box
            onClick={column.getToggleSortingHandler()}
            sx={{
              alignItems: 'center',
              cursor:
                colCanSort && columnDefType !== 'group' ? 'pointer' : undefined,
              display: 'flex',
              flexWrap: 'nowrap',
              m: muiTableHeadCellProps?.align === 'center' ? 'auto' : undefined,
              pl:
                muiTableHeadCellProps?.align === 'center' && colCanSort
                  ? '1rem'
                  : undefined,
              whiteSpace:
                (columnDef.header?.length ?? 0) < 24 ? 'nowrap' : 'normal',
            }}
          >
            {headerElement}
            {colCanSort && <HaiTableHeadCellSortLabel header={header} />}
          </Box>
        </Box>
      )}
    </TableCell>
  );
};
