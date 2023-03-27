import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LookupsValuesScriptsComponent } from './scripts-dialogs/lookups-values/lookups-values.component';
import { TranslationsScriptsComponent } from './scripts-dialogs/translations/translations.component';
import { ClipboardService } from 'ngx-clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sql-template';
  showManage: boolean = false;
  mySqlScript: string;
  oracleScript: string;
  sqlScript: string;

  constructor(public dialog: MatDialog, private clipboardApi: ClipboardService, private _messageService: MatSnackBar) {
  }

  copyScript(value: string, key: string) {
    this.clipboardApi.copyFromContent(value);
    this._messageService.open(`Successfully Copy The ${key} Code`, "X", {
      duration: 6000,
      panelClass: 'success'
    });
  }

  generateLookupsValuesScripts() {
    this.showManage = true;
    const dialog = this.dialog.open(LookupsValuesScriptsComponent, {
      panelClass: ['animate__animated', 'animate__slideInRight'],
      position: { right: '0' },
      height: '100%',
      width: '70%'
    });

    dialog.afterClosed().subscribe(
      (result: { save: boolean, mySqlScript: string, oraclrScript: string, sqlScript: string }) => {
        this.showManage = false;
        if (result && result.save) {
          this.mySqlScript = result.mySqlScript;
          this.oracleScript = result.oraclrScript;
          this.sqlScript = result.sqlScript;
        }
      }
    );
  }

  generateTranslationsScripts() {
    this.showManage = true;
    const dialog = this.dialog.open(TranslationsScriptsComponent, {
      panelClass: ['animate__animated', 'animate__slideInRight'],
      position: { right: '0' },
      height: '100%',
      width: '70%'
    });

    dialog.afterClosed().subscribe(
      (result: { save: boolean, mySqlScript: string, oraclrScript: string, sqlScript: string }) => {
        this.showManage = false;
        if (result && result.save) {
          this.mySqlScript = result.mySqlScript;
          this.oracleScript = result.oraclrScript;
          this.sqlScript = result.sqlScript;
        }
      }
    );
  }
}
