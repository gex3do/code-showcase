import React, {FC} from 'react';
import {Box} from '@mui/material';
import {HaiTablePagination} from './HaiTablePagination';
import {HaiTableInstance} from '../index';

interface Props {
  table: HaiTableInstance;
}

export const HaiToolbarBottom: FC<Props> = ({table}) => {
  const {
    getCoreRowModel,
    getState,
    options: {enableSelectionCounts, enablePagination},
  } = table;
  const {rowSelection} = getState();
  const totalRowsCount = getCoreRowModel().rows.length;
  const selectedRowsCount = Object.keys(rowSelection).length;
  const displaySelectionCount = enableSelectionCounts && selectedRowsCount > 0;
  const displayBottomToolbar = enablePagination || displaySelectionCount;
  return (
    <>
      {displayBottomToolbar ? (
        <div style={{width: '100%'}}>
          <Box
            sx={{
              display: 'flex',
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                paddingTop: '14px',
              }}
            >
              {displaySelectionCount && (
                <>
                  {/* we display the total row count since selecting on multiple pages is supported */}
                  {selectedRowsCount} of {totalRowsCount} total rows selected
                </>
              )}
            </Box>
            <Box>
              {enablePagination && <HaiTablePagination table={table} />}
            </Box>
          </Box>
        </div>
      ) : (
        <>
          {/* use a placeholder if toolbar is not displayed to keep the table height stable */}
          <Box sx={{height: '52px'}}></Box>
        </>
      )}
    </>
  );
};
