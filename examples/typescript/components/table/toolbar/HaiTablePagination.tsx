import React, {ChangeEvent, FC} from 'react';
import {TablePagination} from '@mui/material';
import {HaiTableInstance} from '../index';

interface Props {
  table: HaiTableInstance;
}

export const HaiTablePagination: FC<Props> = ({table}) => {
  const {
    getPrePaginationRowModel,
    getState,
    setPagination,
    options: {muiTablePaginationProps, pagination: paginationOptions, rowCount},
  } = table;
  const {
    pagination: {pageSize = paginationOptions.pageSize, pageIndex = 0},
  } = getState();

  const totalRowCount = rowCount ?? getPrePaginationRowModel().rows.length;
  const showFirstLastPageButtons = totalRowCount / pageSize > 2;

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setPagination({
      pageSize: Number.parseInt(event.target.value),
      pageIndex: pageIndex,
    });
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPagination({
      pageSize: pageSize,
      pageIndex: newPage,
    });
  };

  return (
    <TablePagination
      SelectProps={{
        sx: {m: '0 1rem 0 1ch'},
        MenuProps: {MenuListProps: {disablePadding: true}},
      }}
      component="div"
      count={totalRowCount}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      page={pageIndex}
      rowsPerPage={pageSize}
      rowsPerPageOptions={paginationOptions.pageSizeOptions}
      showFirstButton={showFirstLastPageButtons}
      showLastButton={showFirstLastPageButtons}
      {...muiTablePaginationProps}
      sx={{
        m: '0',
        position: 'relative',
        zIndex: 2,
        ...(muiTablePaginationProps?.sx as any),
      }}
    />
  );
};
