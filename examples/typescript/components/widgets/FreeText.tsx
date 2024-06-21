import React from 'react';
import {Grid} from '@mui/material';
import {useIcons} from '../../libs/icons';
import {WidgetWrapper} from '.';

export interface FreeTextProps {
  title?: string;
  content: string;
  icon?: string;
}

export function FreeText(props: any) {
  const Icon = props?.icon ? useIcons(props.icon) : null;
  const title =
    props.title || Icon ? (
      <Grid
        sx={{display: 'flex', alignItems: 'center'}}
        data-testid="freetext-header"
      >
        {Icon && (
          <Icon
            sx={{marginRight: '6px', fontSize: '1rem'}}
            data-testid="freetext-icon"
          />
        )}
        {props.title}
      </Grid>
    ) : null;

  return (
    <WidgetWrapper
      sx={{
        backgroundColor: props.bgColor,
        color: props.textColor,
        flexGrow: 1,
      }}
      title={title}
      data-testid="freetext"
    >
      <span
        data-testid="freetext-content"
        dangerouslySetInnerHTML={{
          __html: props.content,
        }}
      />
    </WidgetWrapper>
  );
}
