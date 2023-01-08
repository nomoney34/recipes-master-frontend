import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [RecipeListComponent],
  imports: [CommonModule, SharedModule],
})
export class RecipeModuleModule {}
