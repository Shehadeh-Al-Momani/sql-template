import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LookupsValuesScriptsComponent } from './lookups-values-scripts/lookups-values-scripts.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sql-template';
  showManage: boolean = false;
  mySqlScript: string;
  oraclrScript: string;
  sqlScript: string;

  constructor(public dialog: MatDialog) { }

  addPortal() {
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
          this.oraclrScript = result.oraclrScript;
          this.sqlScript = result.sqlScript;
        }
      }
    );
  }
}
