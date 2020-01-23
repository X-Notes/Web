import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainersComponent } from './Containers/containers.component';
import { ContainerComponent} from './container/container.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [ContainersComponent, ContainerComponent],
    imports: [
      CommonModule,
      HttpClientModule,
      FormsModule
    ],
    exports: [ContainersComponent]
  })
export class ContainersModule {}
