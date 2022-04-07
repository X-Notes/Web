import { Observable } from 'rxjs';

export interface MenuItem {
  icon: string;
  isVisible?: Observable<boolean>;
  isActive?: Observable<boolean>;
  class?: string;
  operation: () => void;
  isOnlyForAuthor: boolean;
  IsNeedEditRightsToSee: boolean;
  tooltip?: Observable<string>;
}
