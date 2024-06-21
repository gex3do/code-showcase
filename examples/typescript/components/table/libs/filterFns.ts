import {rankItem, rankings, RankingInfo} from '@tanstack/match-sorter-utils';
import {filterFns, Row} from '@tanstack/react-table';

// Approximate string matching algorithm (very useful for table search through the rows)
const fuzzy = <TData extends Record<string, any>>(
  row: Row<TData>,
  columnId: string,
  filterValue: string | number,
  addMeta: (item: RankingInfo) => void
) => {
  const itemRank = rankItem(row.getValue(columnId), filterValue as string, {
    threshold: rankings.CONTAINS,
  });
  addMeta(itemRank);
  return itemRank.passed;
};

fuzzy.autoRemove = (val: any) => !val;

export const haiFilterFns = {
  ...filterFns,
  fuzzy,
};
