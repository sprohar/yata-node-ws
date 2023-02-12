export class Task {}

export namespace Task {
  export enum Name {
    MAX_LENGTH = 256,
  }

  export enum Description {
    MAX_LENGTH = 8192,
  }

  export enum OrderBy {
    NAME = 'name',
    PRIORITY = 'priority',
    DUE_DATE = 'dueDate',
    INCEPTION = 'createdAt',
    DEFAULT = 'createdAt'
  }
}
