import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DialogService } from './scripts-dialogs/dialog.service';
import { LookupsValuesScriptsComponent } from './scripts-dialogs/lookups-values/lookups-values.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  HighlightModule,
  HighlightOptions,
  HIGHLIGHT_OPTIONS,
} from 'ngx-highlightjs';
import { PipesModule } from './pipes/pipes.module';
import { TranslationsScriptsComponent } from './scripts-dialogs/translations/translations.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddColumnScriptsComponent } from './scripts-dialogs/add-column/add-column.component';
import { InsertDataScriptsComponent } from './scripts-dialogs/insert-data/insert-data.component';
import { SystemMenusScriptsComponent } from './scripts-dialogs/system-menus/system-menus.component';

@NgModule({
  declarations: [
    AppComponent,
    LookupsValuesScriptsComponent,
    TranslationsScriptsComponent,
    AddColumnScriptsComponent,
    InsertDataScriptsComponent,
    SystemMenusScriptsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    HighlightModule,
    PipesModule,
    MatSnackBarModule
  ],
  providers: [
    DialogService,
    MatSnackBar,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: <HighlightOptions>{
        lineNumbers: true,
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
        languages: {
          sql: () => import('highlight.js/lib/languages/sql')
        },
      },
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
