import React, {FC} from 'react';
import {Checkbox} from '@mui/material';
import {Row} from '@tanstack/react-table';
import {HaiTableInstance} from '../index';

interface Props<TData extends Record<string, any>> {
  row?: Row<TData>;
  selectAll?: boolean;
  table: HaiTableInstance;
}

export const HaiSelectCheckbox: FC<Props<any>> = ({row, selectAll, table}) => {
  const {
    options: {muiSelectCheckboxProps, muiSelectAllCheckboxProps, selectAllMode},
  } = table;

  const checkboxProps = !row
    ? muiSelectAllCheckboxProps instanceof Function
      ? muiSelectAllCheckboxProps({table})
      : muiSelectAllCheckboxProps
    : muiSelectCheckboxProps instanceof Function
    ? muiSelectCheckboxProps({row, table})
    : muiSelectCheckboxProps;

  return (
    <Checkbox
      checked={selectAll ? table.getIsAllRowsSelected() : row?.getIsSelected()}
      indeterminate={
        selectAll ? table.getIsSomeRowsSelected() : row?.getIsSomeSelected()
      }
      inputProps={{
        'aria-label': selectAll ? 'select all rows' : 'select row',
      }}
      onChange={
        !row
          ? selectAllMode === 'all'
            ? table.getToggleAllRowsSelectedHandler()
            : table.getToggleAllPageRowsSelectedHandler()
          : row.getToggleSelectedHandler()
      }
      size={'small'}
      {...checkboxProps}
      sx={theme => ({
        height: '2.7rem',
        width: '2.7rem',
        m: '-0.4rem',
        ...(checkboxProps?.sx instanceof Function
          ? checkboxProps.sx(theme)
          : (checkboxProps?.sx as any)),
      })}
    />
  );
};
