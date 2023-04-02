import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../../app.component';
import { DialogService } from '../dialog.service';

@Component({
  selector: 'insert-data-scripts',
  templateUrl: './insert-data.component.html'
})
export class InsertDataScriptsComponent implements OnInit {
  tableName: string;
  columnsNamesConditions: string;
  columnsValuesConditions: string;
  columnsNamesInsert: string;
  columnsValuesInsert: string;
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
      this.mySqlScript = this.generateMySqlScripts(this.tableName, this.columnsNamesConditions, this.columnsValuesConditions, this.columnsNamesInsert, this.columnsValuesInsert);
      this.oraclrScript = this.generateOracleScripts(this.tableName, this.columnsNamesConditions, this.columnsValuesConditions, this.columnsNamesInsert, this.columnsValuesInsert);
      this.sqlScript = this.generateSqlScripts(this.tableName, this.columnsNamesConditions, this.columnsValuesConditions, this.columnsNamesInsert, this.columnsValuesInsert);
    }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateMySqlScripts(tableName: string, columnsNamesConditions: string, columnsValuesConditions: string, columnsNamesInsert: string, columnsValuesInsert: string): string {
    const columnsNamesConditionsArr = columnsNamesConditions.split("\n");
    const columnsValuesConditionsArr = columnsValuesConditions.split("\n");
    const columnsNamesInsertArr = columnsNamesInsert.split("\n");
    const columnsValuesInsertArr = columnsValuesInsert.split("\n");

    let whereStatement = "";
    let insertStatement = "";
    let insertStatementValues = "";

    for (let index = 0; index < columnsNamesConditionsArr.length; index++) {
      const element = columnsNamesConditionsArr[index].trim();
      const value = columnsValuesConditionsArr[index].trim();

      if (index === 0) {
        whereStatement += `WHERE \`${element}\` = '${value}'`;
      }
      else {
        whereStatement += ` AND \`${element}\` = '${value}'`;
      }
    }

    for (let index = 0; index < columnsNamesInsertArr.length; index++) {
      const element = columnsNamesInsertArr[index];

      if (index === 0) {
        insertStatement += `\`${element}\``;
      }
      else {
        insertStatement += `, \`${element}\``;
      }
    }

    for (let index = 0; index < columnsValuesInsertArr.length; index++) {
      const element = columnsValuesInsertArr[index] == undefined || columnsValuesInsertArr[index] === 'NULL' ? null :
        ~~columnsValuesInsertArr[index] > 0 || columnsValuesInsertArr[index] == '0' ? ~~columnsValuesInsertArr[index] : `'${columnsValuesInsertArr[index]}'`;

      if (index === 0) {
        insertStatementValues = `${insertStatementValues}${element}`;
      }
      else {
        insertStatementValues = `${insertStatementValues}, ${element}`;
      }
    }

    const sqlStatement = `INSERT INTO \`${tableName}\` (${insertStatement})\r\nSELECT ${insertStatementValues}\r\nWHERE NOT EXISTS (SELECT * FROM ${tableName} ${whereStatement} );`;
    return sqlStatement;
  }

  generateOracleScripts(tableName: string, columnsNamesConditions: string, columnsValuesConditions: string, columnsNamesInsert: string, columnsValuesInsert: string): string {
    const columnsNamesConditionsArr = columnsNamesConditions.split("\n");
    const columnsValuesConditionsArr = columnsValuesConditions.split("\n");
    const columnsNamesInsertArr = columnsNamesInsert.split("\n");
    const columnsValuesInsertArr = columnsValuesInsert.split("\n");

    let whereStatement = "";
    let insertStatement = "";
    let insertStatementValues = "";

    for (let index = 0; index < columnsNamesConditionsArr.length; index++) {
      const element = columnsNamesConditionsArr[index].trim();
      const value = columnsValuesConditionsArr[index].trim();

      if (index === 0) {
        whereStatement += `WHERE ${element} = '${value}'`;
      }
      else {
        whereStatement += ` AND ${element} = '${value}'`;
      }
    }

    for (let index = 0; index < columnsNamesInsertArr.length; index++) {
      const element = columnsNamesInsertArr[index];

      if (index === 0) {
        insertStatement += `${element}`;
      }
      else {
        insertStatement += `, ${element}`;
      }
    }

    for (let index = 0; index < columnsValuesInsertArr.length; index++) {
      const element = columnsValuesInsertArr[index] == undefined || columnsValuesInsertArr[index] === 'NULL' ? null :
        ~~columnsValuesInsertArr[index] > 0 || columnsValuesInsertArr[index] == '0' ? ~~columnsValuesInsertArr[index] : `'${columnsValuesInsertArr[index]}'`;

      if (index === 0) {
        insertStatementValues = `${insertStatementValues}${element}`;
      }
      else {
        insertStatementValues = `${insertStatementValues}, ${element}`;
      }
    }

    const sqlStatement = `DECLARE\r\n  V_COL_EXISTS NUMBER := 0;\r\nBEGIN\r\n    SELECT COUNT(*) INTO V_COL_EXISTS FROM ${tableName} ${whereStatement};\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n        INSERT INTO ${tableName} (${insertStatement}) \r\n        VALUES (${insertStatementValues});\r\n    END IF; \r\n END;\r\n /`;
    return sqlStatement;
  }

  generateSqlScripts(tableName: string, columnsNamesConditions: string, columnsValuesConditions: string, columnsNamesInsert: string, columnsValuesInsert: string): string {
    const columnsNamesConditionsArr = columnsNamesConditions.split("\n");
    const columnsValuesConditionsArr = columnsValuesConditions.split("\n");
    const columnsNamesInsertArr = columnsNamesInsert.split("\n");
    const columnsValuesInsertArr = columnsValuesInsert.split("\n");

    let whereStatement = "";
    let insertStatement = "";
    let insertStatementValues = "";

    for (let index = 0; index < columnsNamesConditionsArr.length; index++) {
      const element = columnsNamesConditionsArr[index].trim();
      const value = columnsValuesConditionsArr[index].trim();

      if (index === 0) {
        whereStatement += `WHERE [${element}] = '${value}'`;
      }
      else {
        whereStatement += ` AND [${element}] = '${value}'`;
      }
    }

    for (let index = 0; index < columnsNamesInsertArr.length; index++) {
      const element = columnsNamesInsertArr[index];

      if (index === 0) {
        insertStatement += `${element}`;
      }
      else {
        insertStatement += `, ${element}`;
      }
    }

    for (let index = 0; index < columnsValuesInsertArr.length; index++) {
      const element = columnsValuesInsertArr[index];

      if (index === 0) {
        insertStatementValues += `'${element}'`;
      }
      else {
        insertStatementValues += `, '${element}'`;
      }
    }

    const sqlStatement = `IF NOT EXISTS(SELECT * FROM ${tableName} WITH(NOLOCK) ${whereStatement})\r\nBEGIN\r\n\t\tINSERT INTO ${tableName} (${insertStatement}) \r\n\t\tVALUES (${insertStatementValues})\r\nEND`;
    return sqlStatement;
  }
}
