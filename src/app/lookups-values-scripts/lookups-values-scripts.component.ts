import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../app.component';
import { DialogService } from './dialog.service';

@Component({
  selector: 'lookups-values-scripts',
  templateUrl: './lookups-values-scripts.component.html'
})
export class LookupsValuesScriptsComponent implements OnInit {
  codes: string;
  lookupCode: string;
  mySqlScript: string;
  oraclrScript: string;
  sqlScript: string;

  constructor(
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<AppComponent>
  ) { }

  ngOnInit(): void { }

  save(form: NgForm) {
    setTimeout(() => { this.sqlScript = this.generateSqlScripts(this.codes, this.lookupCode); }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateSqlScripts(codes: string, LookupCode: string): string {
    const codesArr = codes.split("\n");
    const lookupStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i];
      let lookupStatement = i === 0 ?
        `SELECT @V_COL_EXISTS = COUNT(*) FROM LOOKUPS_VALUES WHERE CODE = '${code}' AND LOOKUP_CODE='${LookupCode}'
      IF( @V_COL_EXISTS = 0 ) BEGIN
          INSERT INTO LOOKUPS_VALUES(LOOKUP_CODE, CODE, DESCRIPTION, DATA_MAPPING, EDITABLE, CREATE_STAMP, CREATED_BY, IS_DELETED, IS_SYSTEM)
      VALUES('${LookupCode}', '${code}', NULL, NULL, '0', GETDATE(), '1', '0', '1')
          END\n`
        : i === codesArr.length - 1 ?
          `        SELECT @V_COL_EXISTS = COUNT(*) FROM LOOKUPS_VALUES WHERE CODE = '${code}' AND LOOKUP_CODE='${LookupCode}'
      IF( @V_COL_EXISTS = 0 ) BEGIN
          INSERT INTO LOOKUPS_VALUES(LOOKUP_CODE, CODE, DESCRIPTION, DATA_MAPPING, EDITABLE, CREATE_STAMP, CREATED_BY, IS_DELETED, IS_SYSTEM)
      VALUES('${LookupCode}', '${code}', NULL, NULL, '0', GETDATE(), '1', '0', '1')
          END`
          :
          `        SELECT @V_COL_EXISTS = COUNT(*) FROM LOOKUPS_VALUES WHERE CODE = '${code}' AND LOOKUP_CODE='${LookupCode}'
      IF( @V_COL_EXISTS = 0 ) BEGIN
          INSERT INTO LOOKUPS_VALUES(LOOKUP_CODE, CODE, DESCRIPTION, DATA_MAPPING, EDITABLE, CREATE_STAMP, CREATED_BY, IS_DELETED, IS_SYSTEM)
      VALUES('${LookupCode}', '${code}', NULL, NULL, '0', GETDATE(), '1', '0', '1')
          END\n`;

      lookupStatements.push(lookupStatement);
    };

    let sqlStatement = `DECLARE @V_COL_EXISTS INT
    BEGIN
      ${lookupStatements.join('\n')}
  END\n`;

    return sqlStatement;
  }
}
