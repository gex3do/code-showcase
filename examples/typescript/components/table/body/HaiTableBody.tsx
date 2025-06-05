import React, {FC, RefObject, useMemo} from 'react';
import {useVirtual} from 'react-virtual';
import {TableBody} from '@mui/material';
import {HaiTableBodyRow} from './HaiTableBodyRow';
import {HaiTableInstance} from '../index';

interface Props {
  table: HaiTableInstance;
  tableContainerRef: RefObject<HTMLDivElement>;
}

export const HaiTableBody: FC<Props> = ({table, tableContainerRef}) => {
  const {
    getRowModel,
    getPrePaginationRowModel,
    getState,
    options: {
      enablePagination,
      enableRowVirtualization,
      muiTableBodyProps,
      virtualizerProps,
    },
  } = table;

  const {globalFilter} = getState();

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

  const rowVirtualizer = enableRowVirtualization
    ? useVirtual({
        size: rows.length,
        parentRef: tableContainerRef,
        overscan: 15,
        ...virtualizerProps,
      })
    : ({} as any);

  const virtualRows = enableRowVirtualization
    ? rowVirtualizer.virtualItems
    : [];

  let paddingTop = 0;
  let paddingBottom = 0;
  if (enableRowVirtualization) {
    paddingTop = virtualRows.length ? virtualRows[0].start : 0;
    paddingBottom = virtualRows.length
      ? rowVirtualizer.totalSize - virtualRows[virtualRows.length - 1].end
      : 0;
  }

  return (
    <TableBody {...muiTableBodyProps}>
      {enableRowVirtualization && paddingTop > 0 && (
        <tr>
          <td style={{height: `${paddingTop}px`}} />
        </tr>
      )}
      {(enableRowVirtualization ? virtualRows : rows).map(
        (rowOrVirtualRow: any, rowIndex: number) => {
          const row = enableRowVirtualization
            ? rows[rowOrVirtualRow.index]
            : rowOrVirtualRow;
          return (
            <HaiTableBodyRow
              key={row.id}
              row={row}
              rowIndex={
                enableRowVirtualization ? rowOrVirtualRow.index : rowIndex
              }
              table={table}
            />
          );
        }
      )}
      {enableRowVirtualization && paddingBottom > 0 && (
        <tr>
          <td style={{height: `${paddingBottom}px`}} />
        </tr>
      )}
    </TableBody>
  );
};
