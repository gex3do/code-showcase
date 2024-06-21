import React, {useMemo, useRef, useState} from 'react';

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {HaiTableHead} from './head/HaiTableHead';
import {HaiTableBody} from './body/HaiTableBody';
import {HaiTableFooter} from './footer/HaiFooter';
import {HaiToolbarTop} from './toolbar/HaiToolbarTop';
import {HaiToolbarBottom} from './toolbar/HaiToolbarBottom';

import {Table} from '@mui/material';

import {haiFilterFns} from './libs/filterFns';
import {mergeTableOptions} from './libs/options';
import {getTableData, hideColumns} from './libs/rowsAndColumns';
import {prepareColumns} from './libs/rowsAndColumns';
import {WidgetWrapper} from '../widgets';
import {HaiTableEventHandlers, HaiTableInstance} from '.';

export interface HaiTableProps {
  columns: any;
  components: any;
  customOptions: {
    allowedCertStates: Array<string>;
  };
  extraData: object[];
  listeners: HaiTableEventHandlers;
  options: object;
  rows: object[];
}

export function HaiTable(props: HaiTableProps) {
  const tableOptions = mergeTableOptions(props.options, 'HaiTable');

  const data = getTableData(props);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: tableOptions.pagination.pageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const tableColumns = prepareColumns(tableOptions, props.columns);

  const onCellDoubleClick = function (event: any, row: any) {
    if (props.listeners?.onCellDoubleClick) {
      props.listeners.onCellDoubleClick(event, row);
    }
  };

  const onCellClick = function (event: any, row: any) {
    if (props.listeners?.onCellClick) {
      props.listeners.onCellClick(event, row);
    }
  };

  const onCellHover = function (event: any, row: any) {
    if (props.listeners?.onCellHover) {
      props.listeners.onCellHover(event, row);
    }
  };

  const onCellLeave = function (event: any, row: any) {
    if (props.listeners?.onCellLeave) {
      props.listeners.onCellLeave(event, row);
    }
  };

  const onRowDoubleClick = function (event: any, row: any) {
    if (props.listeners?.onRowDoubleClick) {
      props.listeners.onRowDoubleClick(event, row);
    }
  };

  const onRowClick = function (event: any, row: any) {
    if (props.listeners?.onRowClick) {
      props.listeners.onRowClick(event, row);
    }
  };

  const onRowHover = function (event: any, row: any) {
    if (props.listeners?.onRowHover) {
      props.listeners.onRowHover(event, row);
    }
  };

  const onRowLeave = function (event: any, row: any) {
    if (props.listeners?.onRowLeave) {
      props.listeners.onRowLeave(event, row);
    }
  };

  const table = {
    ...useReactTable({
      data,
      columns: useMemo(
        () => tableColumns,
        [
          tableColumns,
          tableOptions.enableSelectAll,
          tableOptions.enableMultiRowSelection,
        ]
      ),
      state: {
        sorting,
        pagination,
        rowSelection,
        globalFilter,
      },
      onSortingChange: setSorting,
      onRowSelectionChange: setRowSelection,
      onPaginationChange: setPagination,
      onGlobalFilterChange: setGlobalFilter,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: haiFilterFns.fuzzy,
    }),
    handlers: {
      onCellDoubleClick,
      onCellClick,
      onCellHover,
      onCellLeave,
      onRowDoubleClick,
      onRowClick,
      onRowHover,
      onRowLeave,
    },
    ...props,
    options: {
      ...tableOptions,
    },
  } as HaiTableInstance;

  // TODO: Sub-optimal code to hide columns, because after each call of `toggleVisibility` function
  //  `render` of the table is called. For now nothing better found, but we need better solution here. For
  //  example somehow provide visibility flag while providing table column-definitions.
  hideColumns(table);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // extract table properties used for rendering
  const {
    options: {
      enableTableFooter,
      enableTableHead,
      enableToolbarBottom,
      enableToolbarTop,
      enableRowVirtualization,
    },
    title,
  } = table;

  return (
    <WidgetWrapper title={title}>
      {enableToolbarTop && <HaiToolbarTop table={table} />}
      <Table
        sx={() => ({
          tableLayout: enableRowVirtualization ? 'fixed' : 'auto',
        })}
      >
        {enableTableHead && <HaiTableHead table={table} />}
        <HaiTableBody tableContainerRef={tableContainerRef} table={table} />
        {enableTableFooter && <HaiTableFooter table={table} />}
      </Table>
      {enableToolbarBottom && <HaiToolbarBottom table={table} />}
    </WidgetWrapper>
  );
}
