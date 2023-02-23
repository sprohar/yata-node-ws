export class Task {}

export namespace Task {
  export enum Priority {
    NONE,
    HIGH,
    MEDIUM,
    LOW,
  }
  
  export enum Title {
    MAX_LENGTH = 1024,
  }

  export enum Content {
    MAX_LENGTH = 8192,
  }

  export enum OrderBy {
    CONTENT = 'content',
    PRIORITY = 'priority',
    DUE_DATE = 'dueDate',
    INCEPTION = 'createdAt',
    DEFAULT = 'createdAt'
  }
}
