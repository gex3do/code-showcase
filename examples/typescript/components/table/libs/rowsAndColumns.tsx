import React from 'react';

import {createColumnHelper} from '@tanstack/react-table';

import {HaiSelectCheckbox} from '../inputs/HaiSelectCheckbox';
import Counter from '../../utils/Counter';
import HaiperLink from '../../utils/HaiperLink';
import {HaiTableInstance} from '..';
import {getNestedProperty} from '../../../libs/utils';

export enum ColumnDefType {
  display,
  accessor,
  group,
}

/**
 * Get table data
 *
 * Sometimes for the table we have reference name instead of rows.
 * This function returns table-data rows directly or from ref-name (if exists)
 *
 * @param props
 */
export const getTableData = (props: any) => {
  return props.rowsRef
    ? getNestedProperty(props.extraData, props.rowsRef)
    : props.rows;
};

export const hideColumns = (table: HaiTableInstance) => {
  table.getAllColumns().forEach((c: any) => {
    const shouldHidden = c.columnDef.meta?.hidden ?? false;
    if (c.getIsVisible() && shouldHidden) {
      c.toggleVisibility(false);
    }
  });
};

export const renderAsColType = (type: string, data: any) => {
  switch (type) {
    case 'counter': {
      return <Counter rawNumber={data.value} />;
    }
    case 'haiperlink': {
      let url = data.value;
      if (!url.startsWith('http')) {
        url = `http://${url}`;
      }
      return (
        <HaiperLink
          defended={data.defended}
          text={data.value}
          href={url}
          target="_blank"
        />
      );
    }
    default:
      return data.value;
  }
};

/**
 * This function implements a very rudimentary concept of "column types"
 *
 * However, we should strive for cleaner code in the long run!
 */
export const renderCell = (col: any, props: any) => {
  const cellValue = props.cell.getValue();
  switch (col.type) {
    case 'counter':
      return renderAsColType('counter', {value: cellValue});
    case 'haiperlink': {
      const rowdata = props.cell.row.original;
      return renderAsColType('haiperlink', {
        value: cellValue,
        defended: rowdata.info?.defended,
      });
    }
    default:
      return cellValue;
  }
};

export function prepareColumns(tableOptions: any, columns: any) {
  const columnHelper = createColumnHelper<any>();
  const displayColumns: any[] = [];

  // prepare `display` columns
  if (tableOptions.enableMultiRowSelection) {
    const c = columnHelper.display({
      id: 'selection',
      header: ({table}) =>
        tableOptions.enableSelectAll ? (
          <HaiSelectCheckbox selectAll table={table as HaiTableInstance} />
        ) : null,
      cell: ({cell, table}: any) => (
        <HaiSelectCheckbox
          row={cell.row as any}
          table={table as HaiTableInstance}
        />
      ),
      meta: {
        columnDefType: ColumnDefType.display,
        hidden: false,
      },
    });
    displayColumns.push(c);
  }

  // prepare `accessor` columns
  columns.forEach((column: any) => {
    const c = columnHelper.accessor(column['field'], {
      id: column['field'],
      header: () => column['title'],
      cell: (props: any) => renderCell(column, props),
      meta: {
        columnDefType: ColumnDefType.accessor,
        hidden: column.hidden ?? false,
      },
    });
    displayColumns.push(c);
  });

  return displayColumns;
}
