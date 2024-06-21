import React, {FC} from 'react';
import {Box} from '@mui/material';
import {HaiGlobalFilterTextField} from '../inputs/HaiGlobalFilterTextField';
import {HaiTableInstance} from '..';

interface Props {
  table: HaiTableInstance;
}

export const HaiToolbarTop: FC<Props> = ({table}) => {
  const {
    options: {enableGlobalFilter},
  } = table;

  return (
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
          }}
        />
        <Box>
          {enableGlobalFilter && (
            <HaiGlobalFilterTextField table={table}></HaiGlobalFilterTextField>
          )}
        </Box>
      </Box>
    </div>
  );
};
