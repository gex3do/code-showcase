import React, {FC, MouseEvent, useState} from 'react';

import {Box, TableRow, Tooltip, useTheme} from '@mui/material';

import {Row} from '@tanstack/react-table';

import {getCurrentAndPrevCertHistory} from '../../../libs/certHistory';
import {DOUBLE_CLICK_DELAY, MouseClickState} from '../../../types/mouse';
import {CertSummary} from '../../CertSummary';
import {OutreasonTableBodyCell} from './OutreasonTableBodyCell';
import {OutreasonTableInstance} from '..';
import {getCertStateData} from '../libs/certs';

interface Props<TData extends Record<string, any>> {
  row: Row<TData>;
  rowIndex: number;
  table: OutreasonTableInstance;
}

// This variable should stay global (outside the functional component), because
// when the component re-renders, this variable resets, and the current mouse state is lost.
// Also, this variable cannot be present as a component state, because
// changing state force component re-rendering, and we do not need that
// for this situation
let clickState: MouseClickState = MouseClickState.NONE;

export const OutreasonTableBodyRow: FC<Props<any>> = ({
  row,
  rowIndex,
  table,
}) => {
  const theme = useTheme();

  const {
    handlers: {onRowDoubleClick, onRowClick, onRowHover, onRowLeave},
    options: {muiTableBodyRowProps},
    popperInfo,
  } = table;

  const rowData = row.original;
  const {style: certStateStyle} = getCertStateData(rowData, theme);
  const certHistory = getCurrentAndPrevCertHistory(
    rowData.entity?.info?.certificationHistory
  );

  const [isHovered, setHover] = useState<boolean>(false);

  let doubleClickTimer: NodeJS.Timeout | undefined;

  const onDoubleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    clickState = MouseClickState.DOUBLE;
    clearTimeout(doubleClickTimer);
    onRowDoubleClick(event, rowData);
  };

  const onClick = (event: MouseEvent<HTMLTableCellElement>) => {
    clickState = MouseClickState.SINGLE;

    doubleClickTimer = setTimeout(() => {
      if (clickState === MouseClickState.SINGLE) {
        onRowClick(event, rowData);
      }

      clickState = MouseClickState.NONE;
    }, DOUBLE_CLICK_DELAY);
  };

  const onHover = (event: MouseEvent<HTMLTableCellElement>) => {
    setHover(true);
    onRowHover(event, rowData);
  };

  const onLeave = (event: MouseEvent<HTMLTableCellElement>) => {
    setHover(false);
    onRowLeave(event, rowData);
  };

  const isPopperOpenedOrRowHovered =
    (popperInfo && popperInfo.record?.entity?.value === rowData.entity.value) ||
    isHovered;

  const renderedRow = () => (
    <TableRow
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseOut={onLeave}
      key={rowIndex}
      {...muiTableBodyRowProps}
      sx={{
        lineHeight: '40px',
        outline: isPopperOpenedOrRowHovered ? '1px dashed #616161' : '',
        outlineOffset: isPopperOpenedOrRowHovered ? '-3px' : '',
        backgroundColor: certStateStyle.backgroundColor,
        ...(muiTableBodyRowProps?.sx as any),
      }}
    >
      {row?.getVisibleCells()?.map?.(cell => (
        <OutreasonTableBodyCell
          cell={cell}
          key={cell.id}
          table={table}
          textColor={certStateStyle.textColor}
        />
      ))}
    </TableRow>
  );

  return (
    <>
      {rowData.entity.type && rowData.entity.info ? (
        <Tooltip
          followCursor
          placement="bottom-start"
          enterDelay={500}
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'common.white',
                color: 'grey.700',
                fontSize: 'small',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                boxShadow: 1,
              },
            },
          }}
          title={
            <Box>
              <CertSummary
                firstSeen={rowData.entity.info.firstSeen}
                currentCert={certHistory.actual}
                previousCert={certHistory.prev}
                totalRecertifications={rowData.entity.info.totalCertifications}
                relativeTime={true}
              />
            </Box>
          }
        >
          {renderedRow()}
        </Tooltip>
      ) : (
        renderedRow()
      )}
    </>
  );
};
