import { Observable } from 'rxjs';

export interface MenuItem {
  icon: string;
  isVisible?: Observable<boolean>;
  isActive?: Observable<boolean>;
  operation: () => void;
  isNoOwnerCanSee: boolean;
  isViewOnFullFolder: boolean;
}
