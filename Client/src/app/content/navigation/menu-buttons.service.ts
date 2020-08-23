import { Injectable } from '@angular/core';
import { MenuItem } from './menu_item';

@Injectable()
export class MenuButtonsService {

  constructor() { }

  currentItems: MenuItem[] = [];

  private notesItems: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => 5
    },
    {
      icon: 'copy',
      operation: () => 5
    },
    {
      icon: 'color',
      operation: () => 5
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    }
  ];

  private foldersItems: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => 5
    },
    {
      icon: 'copy',
      operation: () => 5
    },
    {
      icon: 'color',
      operation: () => 5
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    }
  ];

  private noteInnerItems: MenuItem[] = [
    {
      icon: 'history',
      operation: () => 5
    },
    {
      icon: 'label',
      operation: () => 5
    },
    {
      icon: 'shared',
      operation: () => 5
    },
    {
      icon: 'copy',
      operation: () => 5
    },
    {
      icon: 'color',
      operation: () => 5
    },
    {
      icon: 'download',
      operation: () => 5
    },
    {
      icon: 'lock',
      operation: () => 5
    },
    {
      icon: 'archive',
      operation: () => 5
    },
    {
      icon: 'delete',
      operation: () => 5
    }
  ];

}
