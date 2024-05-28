import { SelectQueryBuilder } from 'typeorm';

export type Pagination<T> = {
  page: number;
  prevPage: number;
  nextPage: number;
  startNode: number;
  endNode: number;
  itemInPage: number;
  items: T[];
};

export interface PaginationConfig {
  ITEM_IN_PAGE: number;
  NODE_PAGE: number;
}

export async function paginations<T>(
  page: number,
  config: PaginationConfig,
  queryBuilder: SelectQueryBuilder<T>,
): Promise<Pagination<T>> {
  if (!page) {
    return null;
  }

  const allRecords = await queryBuilder.getCount();
  const allPages =
    allRecords % config.ITEM_IN_PAGE == 0
      ? (allRecords / config.ITEM_IN_PAGE) | 0
      : ((allRecords / config.ITEM_IN_PAGE) | 0) + 1;

  if (page > allPages) {
    return null;
  }

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < allPages ? page + 1 : null;

  const startNode =
    page -
    (page % config.NODE_PAGE == 0
      ? config.NODE_PAGE
      : page % config.NODE_PAGE) +
    1;
  const endNode =
    startNode + config.NODE_PAGE - 1 <= allPages
      ? startNode + config.NODE_PAGE - 1
      : allPages;

  const items = await queryBuilder
    .skip((page - 1) * config.ITEM_IN_PAGE)
    .take(config.ITEM_IN_PAGE)
    .getMany();

  return {
    page,
    prevPage,
    nextPage,
    startNode,
    endNode,
    itemInPage: config.ITEM_IN_PAGE,
    items,
  };
}

export function getPaginationParameter(
  totalRecords: number,
  page: number,
  config: PaginationConfig,
) {
  if (!page) {
    return null;
  }

  const allPages =
    totalRecords % config.ITEM_IN_PAGE == 0
      ? (totalRecords / config.ITEM_IN_PAGE) | 0
      : ((totalRecords / config.ITEM_IN_PAGE) | 0) + 1;

  if (page > allPages) {
    return null;
  }

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < allPages ? page + 1 : null;

  const startNode =
    page -
    (page % config.NODE_PAGE == 0
      ? config.NODE_PAGE
      : page % config.NODE_PAGE) +
    1;
  const endNode =
    startNode + config.NODE_PAGE - 1 <= allPages
      ? startNode + config.NODE_PAGE - 1
      : allPages;

  return {
    page,
    prevPage,
    nextPage,
    startNode,
    endNode,
    itemInPage: config.ITEM_IN_PAGE,
  };
}
