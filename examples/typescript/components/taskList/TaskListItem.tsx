import {
  Box,
  Chip,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  ListItemTextProps,
  Typography,
  TypographyProps,
} from '@mui/material';

import React from 'react';
import {Task} from './index';
import Counter from '../utils/Counter';
import {getPriorityIcon} from '../../libs/icons';
import {styled, useTheme} from '@mui/material/styles';
import {Link} from 'react-router-dom';
import dates from '../../libs/dates';
import {getTaskTitle} from '../../libs/tasks';

const StyledTrimmedTypography = styled(Typography)<TypographyProps>({
  width: '240px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block',
}) as typeof Typography;

const StyledListItemText = styled(ListItemText)<ListItemTextProps>({
  marginTop: 0,
  marginBottom: 0,
}) as typeof ListItemText;

const StyledListItemButton = styled(ListItemButton)<ListItemButtonProps>({
  padding: '1px',
  minHeight: '46px',
  borderRadius: '12px',
}) as typeof ListItemButton;

const ConcurrentViewers = ({
  testId,
  viewers,
}: {
  testId: string;
  viewers: string[];
}) => {
  if (!viewers) return <></>;
  const viewersInfo = Array.from(viewers).join(' | ');
  return (
    <Typography
      component="span"
      variant={'caption'}
      data-testid={`${testId}-viewers`}
      sx={{color: 'red'}}
    >
      {viewersInfo}
    </Typography>
  );
};

const SecondaryTaskText = ({item, testId}: {item: Task; testId: string}) => {
  let secText = `for ${dates.getMinutesFromNow(item.created)} min`;
  if (item.assignee) {
    secText += ` / ${item.assignee}`;
  }
  return (
    <Typography
      component="span"
      variant={'caption'}
      data-testid={`${testId}-secondary`}
    >
      {secText}
    </Typography>
  );
};

export const TaskListItem = (props: any) => {
  const theme = useTheme();
  const {item, listId, selected, viewers} = props;
  const testId = `task-list-item-${listId}`;

  const taskClasses = item.escalated ? 'task-item escalated' : 'task-item';

  return (
    <Link
      to={`/tasks/${item.id}`}
      style={{color: 'inherit', textDecoration: 'inherit'}}
    >
      <ListItem
        className={taskClasses}
        data-testid={testId}
        disablePadding
        secondaryAction={
          <Chip size={'small'} label={<Counter rawNumber={item.count} />} />
        }
      >
        <StyledListItemButton selected={selected}>
          <ListItemIcon>{getPriorityIcon(item, theme)}</ListItemIcon>
          <StyledListItemText
            primary={
              <>
                <StyledTrimmedTypography
                  component="span"
                  data-testid={`${testId}-primary`}
                >
                  {getTaskTitle(item)}
                  <Box sx={{width: '12px', display: 'inline-block'}} />
                  <ConcurrentViewers testId={testId} viewers={viewers} />
                </StyledTrimmedTypography>
              </>
            }
            secondary={<SecondaryTaskText item={item} testId={testId} />}
          />
        </StyledListItemButton>
      </ListItem>
    </Link>
  );
};
