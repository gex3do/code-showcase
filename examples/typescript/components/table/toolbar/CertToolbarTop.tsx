import React, {FC} from 'react';
import {Box} from '@mui/material';
import {CertifyDropdown} from '../../CertifyDropdown';
import {HaiGlobalFilterTextField} from '../inputs/HaiGlobalFilterTextField';
import {CertTableInstance} from '..';

interface Props {
  table: CertTableInstance;
}

export const HaiToolbarTop: FC<Props> = ({table}) => {
  const {
    options: {enableGlobalFilter, enableCertDropdown},
    certStates,
    handlers: {onCertifyChange},
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
        >
          {enableCertDropdown && (
            <CertifyDropdown
              certStates={certStates}
              onCertifyChange={onCertifyChange}
            />
          )}
        </Box>
        <Box>
          {enableGlobalFilter && (
            <HaiGlobalFilterTextField table={table}></HaiGlobalFilterTextField>
          )}
        </Box>
      </Box>
    </div>
  );
};
