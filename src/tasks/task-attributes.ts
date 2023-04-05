export namespace TaskAttributes {
  export enum Title {
    MAX_LENGTH = 4096,
  }

  export enum Content {
    MAX_LENGTH = 8192,
  }

  export enum Description {
    MAX_LENGTH = 8192,
  }

  export enum OrderBy {
    TITLE = 'title',
    PRIORITY = 'priority',
    DUE_DATE = 'dueDate',
    CREATED_AT = 'createdAt',
  }
}
