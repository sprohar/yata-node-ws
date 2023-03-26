export class Task {}

export namespace Task {
  export enum Priority {
    NONE = 0,
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3,
  }

  export enum Title {
    MAX_LENGTH = 1024,
  }

  export enum Content {
    MAX_LENGTH = 8192,
  }

  export enum OrderBy {
    TITLE = 'title',
    PRIORITY = 'priority',
    DUE_DATE = 'dueDate',
    INCEPTION = 'createdAt',
    DEFAULT = 'createdAt',
  }
}
