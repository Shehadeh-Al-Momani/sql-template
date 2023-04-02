import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../../app.component';
import { DialogService } from '../dialog.service';

@Component({
  selector: 'add-column-scripts',
  templateUrl: './add-column.component.html'
})
export class AddColumnScriptsComponent implements OnInit {
  tableName: string;
  columnName: string;
  columnType: string;
  defaultValue: string;
  mySqlScript: string;
  oraclrScript: string;
  sqlScript: string;

  constructor(
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<AppComponent>
  ) { }

  ngOnInit(): void { }

  save(form: NgForm) {
    setTimeout(() => {
      this.mySqlScript = this.generateMySqlScripts(this.tableName, this.columnName, this.columnType, this.defaultValue);
      this.oraclrScript = this.generateOracleScripts(this.tableName, this.columnName, this.columnType, this.defaultValue);
      this.sqlScript = this.generateSqlScripts(this.tableName, this.columnName, this.columnType, this.defaultValue);
    }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateMySqlScripts(tableName: string, columnName: string, columnType: string, defaultValue: string): string {
    defaultValue = defaultValue === undefined ? 'NULL' : `${defaultValue} NOT NULL`;
    const sqlStatement = `SET @COLUMN_EXISTS = (\r\n\tSELECT COUNT(*)\r\n\tFROM INFORMATION_SCHEMA.COLUMNS\r\n\tWHERE TABLE_NAME = '${tableName}'\r\n\tAND COLUMN_NAME = '${columnName}');    \r\n      \r\n    SET @QUERY = IF(@COLUMN_EXISTS = 0, 'ALTER TABLE ${tableName} ADD ${columnName} ${columnType} DEFAULT ${defaultValue};', 'SELECT \\'Column ${columnName} Exists\\'');\r\n\tPREPARE STATEMENT FROM @QUERY;\r\n    EXECUTE STATEMENT;`;
    return sqlStatement;
  }

  generateOracleScripts(tableName: string, columnName: string, columnType: string, defaultValue: string): string {
    defaultValue = defaultValue === undefined ? 'NULL' : `${defaultValue} NOT NULL`;
    const sqlStatement = `DECLARE\r\n  V_COULMN_EXISTS NUMBER := 0;  \r\nBEGIN\r\n  SELECT COUNT(*) INTO V_COULMN_EXISTS\r\n    FROM USER_TAB_COLS\r\n    WHERE UPPER(TABLE_NAME) = '${tableName}' AND UPPER(COLUMN_NAME) = '${columnName}';\r\n  IF (V_COULMN_EXISTS = 0) THEN\r\n      EXECUTE IMMEDIATE 'ALTER TABLE ${tableName} ADD (${columnName} ${columnType} DEFAULT ${defaultValue})';\r\n  END IF;\r\nEND;\r\n/`;
    return sqlStatement;
  }

  generateSqlScripts(tableName: string, columnName: string, columnType: string, defaultValue: string): string {
    defaultValue = defaultValue === undefined ? 'NULL' : `${defaultValue} NOT NULL`;
    const sqlStatement = `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${columnName}')\r\nBEGIN\r\nALTER TABLE ${tableName} ADD ${columnName} ${columnType} DEFAULT ${defaultValue}\r\nEND`;
    return sqlStatement;
  }
}
