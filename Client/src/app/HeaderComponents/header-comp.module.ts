import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderMenuComponent } from './header-menu/header-menu.component';

@NgModule({
    declarations: [
        HeaderMenuComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [HeaderMenuComponent]
})
export class HeaderModule {}
