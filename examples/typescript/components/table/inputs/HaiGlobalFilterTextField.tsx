import React, {ChangeEvent, FC, useCallback, useState} from 'react';
import {
  debounce,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import {HaiTableInstance} from '../index';

interface Props {
  table: HaiTableInstance;
}

export const HaiGlobalFilterTextField: FC<Props> = ({table}) => {
  const {
    getState,
    setGlobalFilter,
    options: {
      icons: {SearchIcon, CloseIcon},
      muiSearchTextFieldProps,
      tableId,
    },
  } = table;
  const {globalFilter} = getState();

  const [searchValue, setSearchValue] = useState(globalFilter ?? '');

  const handleChangeDebounced = useCallback(
    debounce((event: ChangeEvent<HTMLInputElement>) => {
      setGlobalFilter(event.target.value ?? undefined);
    }, 250),
    []
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    handleChangeDebounced(event);
  };

  const handleClear = () => {
    setSearchValue('');
    setGlobalFilter(undefined);
  };

  const textFieldProps =
    muiSearchTextFieldProps instanceof Function
      ? muiSearchTextFieldProps({table})
      : muiSearchTextFieldProps;

  return (
    <TextField
      sx={{marginTop: '8px', marginBottom: '8px'}}
      id={`${tableId}-search-text-field`}
      placeholder={'search'}
      onChange={handleChange}
      value={searchValue ?? ''}
      variant="standard"
      InputProps={{
        startAdornment: <SearchIcon style={{marginRight: '4px'}} />,
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip arrow title={'ClearSearch'}>
              <span>
                <IconButton
                  aria-label={'Clear search'}
                  disabled={!searchValue?.length}
                  onClick={handleClear}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ),
      }}
      {...textFieldProps}
    />
  );
};
