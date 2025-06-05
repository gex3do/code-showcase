import React from 'react';
import {Grid} from '@mui/material';
import {TaskWidget} from './index';
import {Widgets} from './index';

export interface VSplitData {
  width: number;
  data: TaskWidget;
}

export type VSplitProps = Array<VSplitData>;

export function VSplit(props: any) {
  const gridCols = Object.values(props).filter(
    (gridCol: any) => gridCol['width']
  );

  return (
    <Grid
      data-testid="vsplit-container"
      container
      rowSpacing={0}
      columnSpacing={1}
      sx={{height: '100%'}}
    >
      {gridCols.map((gridCol: any, colIndex: number) => (
        <Grid
          data-testid={`vsplit-column-${colIndex}`}
          item
          md={gridCol.width}
          key={colIndex}
          sx={{display: 'flex', flexDirection: 'column'}}
        >
          {gridCol.data.map((widget: TaskWidget, visIndex: number) => {
            const Widget = Widgets[widget.type];
            const widgetData = {
              ...widget.data,
              extraData: props.extraData,
            };
            return <Widget {...widgetData} key={visIndex} />;
          })}
        </Grid>
      ))}
    </Grid>
  );
}
