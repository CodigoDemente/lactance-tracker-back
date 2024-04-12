export type Pagination<T = unknown> = {
  page: number;
  total: number;
  items: T[];
};
