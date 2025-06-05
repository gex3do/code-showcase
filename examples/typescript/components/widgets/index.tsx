import React from 'react';

import {Card, CardContent, CardHeader} from '@mui/material';

import {FreeText, FreeTextProps} from './FreeText';
import {VSplit, VSplitProps} from './VSplit';
import {BasicTable, BasicTableProps} from './BasicTable';
import {CertTable, CertTableProps} from './CertTable';
import {OutreasonTable, OutreasonTableProps} from './OutreasonTable';

export enum TaskWidgetType {
  FreeText = 'FreeText',
  VSplit = 'VSplit',
  BasicTable = 'BasicTable',
  CertTable = 'CertTable',
  OutreasonTable = 'OutreasonTable',
}

export type TaskWidgetData =
  | BasicTableProps
  | CertTableProps
  | OutreasonTableProps
  | FreeTextProps
  | VSplitProps;

export interface TaskWidget {
  type: TaskWidgetType;
  data: TaskWidgetData;
}

export function WidgetWrapper(props: any) {
  const {title, ...propsToPassOn} = props;
  return (
    <Card sx={{mt: '30px'}} {...propsToPassOn}>
      {title !== undefined && <CardHeader title={title} />}
      <CardContent>{propsToPassOn.children}</CardContent>
    </Card>
  );
}

export const Widgets = {
  [TaskWidgetType.FreeText]: FreeText,
  [TaskWidgetType.VSplit]: VSplit,
  [TaskWidgetType.BasicTable]: BasicTable,
  [TaskWidgetType.CertTable]: CertTable,
  [TaskWidgetType.OutreasonTable]: OutreasonTable,
};
