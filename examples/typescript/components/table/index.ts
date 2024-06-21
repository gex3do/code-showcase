/* eslint-disable @typescript-eslint/no-unused-vars */
import {RowData, Table, TableOptions} from '@tanstack/react-table';
import {HaiIcons} from './Icons';
import {CertStateData} from '../../libs/certStates';
import {ColumnDefType} from './libs/rowsAndColumns';
import {CertHistoryType} from '../../libs/certHistory';
import {CertifiableEntity} from '../../types';

export interface CertTableRowState {
  anchorPos?: {
    left: number;
    top: number;
  };
  record?: {
    transactionCount: number;
    entity: {
      type: CertifiableEntity;
      id: number;
      value: string;
      info: {
        firstSeen: number | null;
        totalCertifications: number;
        certificationHistory: CertHistoryType;
        state: string;
      };
    };
  };
}

export interface OutreasonTableRowState
  extends Omit<CertTableRowState, 'record'> {
  record?: {
    transactionCount: number;
    outReason: number;
    entity: {
      type: CertifiableEntity;
      id: number;
      value: string;
      info: {
        availableCertStates: string[]; // FIXME: We need a type to express that these are supposed to be certstates in uppercase with underscore (e.g. SPAM_PHISHING)
        firstSeen: number | null;
        totalCertifications: number;
        certificationHistory: CertHistoryType;
        state: string;
      };
      label: string;
    };
  };
}

// note: recommendation how to extend meta interface https://tanstack.com/table/v8/docs/api/core/column-def#meta
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    columnDefType: ColumnDefType;
    hidden: boolean;
  }
}

export type TableType = 'HaiTable' | 'CertTable' | 'OutreasonTable';

export type HaiReactTableProps<TData extends Record<string, any>> = Partial<
  TableOptions<TData>
> & {
  enableCertDropdown?: boolean;
  enableGlobalFilter: boolean;
  enableMultiRowSelection: boolean;
  enablePagination: boolean;
  enableRowVirtualization: boolean;
  enableSelectAll: boolean;
  enableSelectionCounts: boolean;
  enableTableFooter: boolean;
  enableTableHead: boolean;
  enableToolbarBottom: boolean;
  enableToolbarTop: boolean;
  icons: HaiIcons;
  selectAllMode: 'page' | 'all' | undefined;
  pagination: {
    pageSize: number;
    pageSizeOptions: Array<number>;
  };
  selection?: boolean;
  muiTableHeadProps?: any;
  muiTableHeadCellProps?: any;
  muiTableBodyCellProps?: any;
  muiTableBodyProps?: any;
  muiTableHeadRowProps?: any;
  muiSearchTextFieldProps?: any;
  muiSelectCheckboxProps?: any;
  muiSelectAllCheckboxProps?: any;
  muiTableBodyRowProps?: any;
  muiTablePaginationProps?: any;
  virtualizerProps?: any;
  tableId?: string;
  rowCount?: number;
};

export interface HaiTableEventHandlers {
  onCellDoubleClick?: any;
  onCellClick?: any;
  onCellHover?: any;
  onCellLeave?: any;
  onRowDoubleClick?: any;
  onRowClick?: any;
  onRowHover?: any;
  onRowLeave?: any;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type HaiTableInstance<TData extends Record<string, any> = {}> = Omit<
  Table<TData>,
  'options'
> & {
  options: HaiReactTableProps<TData>;
  handlers: HaiTableEventHandlers;
  title?: string;
};

export interface CertTableEventHandlers extends HaiTableEventHandlers {
  onCertifyChange?: any;
}

export type CertTableInstance = HaiTableInstance & {
  certStates: CertStateData[];
  handlers: CertTableEventHandlers;
  popperInfo?: CertTableRowState;
};

export type OutreasonTableInstance = HaiTableInstance & {
  handlers: CertTableEventHandlers;
  popperInfo?: OutreasonTableRowState;
};
