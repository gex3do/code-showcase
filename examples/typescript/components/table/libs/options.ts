import {HaiDefaultIcons} from '../Icons';
import {TableType} from '..';

export interface HaiTableOptions {
  enableToolbarTop: boolean; // includes [enableCertDropdown, enableGlobalFilter]
  enableToolbarBottom: boolean; // includes [enableSelectionCounts, enablePagination]
  enableTableHead: boolean;
  enableTableFooter: boolean;
  enableGlobalFilter: boolean; // search through table rows
  enableRowVirtualization: boolean; // technical stuff to speed-up rows rendering
  enablePagination: boolean;
  enableSelectionCounts: boolean; // show text which shows how many rows are selected
  enableMultiRowSelection: boolean;
  enableSelectAll: boolean; // show `select all` checkbox
  selectAllMode: string; // ('all'|'page') -- `page`: `select all` checkbox selects the rows *only on the current page, otherwise all rows
  icons: object;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: number[];
  };
}

export interface CertTableOptions extends HaiTableOptions {
  enableCertDropdown: boolean; // certification dropdown
}

interface DefaultOptions {
  HaiTable: HaiTableOptions;
  CertTable: CertTableOptions;
  OutreasonTable: CertTableOptions;
}

const defaultHaiTableOptions = {
  enableToolbarTop: true,
  enableToolbarBottom: true,
  enableTableHead: true,
  enableTableFooter: true,
  enableGlobalFilter: true,
  enableRowVirtualization: true,
  enablePagination: true,
  enableSelectionCounts: true,
  enableMultiRowSelection: true,
  enableSelectAll: true,
  selectAllMode: 'page',
  icons: {
    ...HaiDefaultIcons,
  },
  pagination: {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 25, 50, 100],
  },
};

const defaultOptions: DefaultOptions = {
  HaiTable: defaultHaiTableOptions,
  CertTable: {
    ...defaultHaiTableOptions,
    enableCertDropdown: true,
  },
  OutreasonTable: {
    ...defaultHaiTableOptions,
    enableCertDropdown: true,
  },
};

export const mergeTableOptions = (options: any, tableType: TableType) => {
  const tableOptions = {
    ...defaultOptions[tableType],
    ...options,
  };

  // conditionally enable top toolbar
  tableOptions.enableToolbarTop =
    tableOptions.enableGlobalFilter ||
    tableOptions.enableCertDropdown ||
    tableOptions.enableToolbarTop;

  // conditionally enable bottom toolbar
  tableOptions.enableToolbarBottom =
    tableOptions.enablePagination ||
    tableOptions.enableSelectionCounts ||
    tableOptions.enableToolbarBottom;
  return tableOptions;
};
