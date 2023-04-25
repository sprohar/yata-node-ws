import { TaskView } from '../enums';

export interface UserPreference {
  isDarkTheme?: boolean;
  defaultDueDateToday?: boolean;
  taskView?: TaskView;
}
