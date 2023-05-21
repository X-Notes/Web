import { Observable } from 'rxjs';

export interface MenuItem {
  icon: string;
  isVisible?: Observable<boolean>;
  isActive?: Observable<boolean>;
  class?: string;
  name?: string;
  operation: () => void;
  isOnlyForAuthor: boolean;
  IsNeedEditRightsToSee: boolean;
  isDisableForShared?: boolean;
  tooltip?: Observable<string>;
}
