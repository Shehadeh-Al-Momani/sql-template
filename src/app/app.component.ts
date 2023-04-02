import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LookupsValuesScriptsComponent } from './scripts-dialogs/lookups-values/lookups-values.component';
import { TranslationsScriptsComponent } from './scripts-dialogs/translations/translations.component';
import { ClipboardService } from 'ngx-clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddColumnScriptsComponent } from './scripts-dialogs/add-column/add-column.component';
import { InsertDataScriptsComponent } from './scripts-dialogs/insert-data/insert-data.component';

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
  showMySql: boolean = false;
  showOracle: boolean = false;
  showSql: boolean = false;

  constructor(public dialog: MatDialog, private clipboardApi: ClipboardService, private _messageService: MatSnackBar) {
  }

  showScript(value: string, key: string) {
    switch (key) {
      case 'MySql':
        this.showMySql = true;
        this.showOracle = false;
        this.showSql = false;
        break;
      case 'Oracle':
        this.showOracle = true;
        this.showMySql = false;
        this.showSql = false;
        break;
      case 'SQL':
        this.showSql = true;
        this.showMySql = false;
        this.showOracle = false;
        break;
      default:
        break;
    };

    this.copyScript(value, key);
  }

  copyScript(value: string, key: string) {
    this.clipboardApi.copyFromContent(value);
    this._messageService.open(`Successfully Copy The ${key} Code`, "X", {
      duration: 6000,
      panelClass: 'success'
    });
  }

  generateAddColumnScripts() {
    this.showManage = true;
    const dialog = this.dialog.open(AddColumnScriptsComponent, {
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

  generateInsertDataScripts() {
    this.showManage = true;
    const dialog = this.dialog.open(InsertDataScriptsComponent, {
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
