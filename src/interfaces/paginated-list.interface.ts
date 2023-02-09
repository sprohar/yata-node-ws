export interface PaginatedList<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
