import { Observable } from 'rxjs';

export interface MenuItem {
  icon: string;
  isVisible?: Observable<boolean>;
  isActive?: Observable<boolean>;
  class?: string;
  operation: () => void;
  isNoOwnerCanSee: boolean;
  isViewOnFullFolder: boolean;
  tooltip?: Observable<string>;
}
