import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../../app.component';
import { DialogService } from '../dialog.service';

@Component({
  selector: 'lookups-values-scripts',
  templateUrl: './lookups-values.component.html'
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
    setTimeout(() => {
      this.mySqlScript = this.generateMySqlScripts(this.codes, this.lookupCode);
      this.oraclrScript = this.generateOracleScripts(this.codes, this.lookupCode);
      this.sqlScript = this.generateSqlScripts(this.codes, this.lookupCode);
    }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateMySqlScripts(codes: string, LookupCode: string): string {
    const codesArr = codes.split("\n");
    const lookupStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i];
      let lookupStatement = `INSERT INTO \`LOOKUPS_VALUES\` (\`LOOKUP_CODE\`,\`CODE\`,\`DESCRIPTION\`,\`DATA_MAPPING\`,\`EDITABLE\`,\`CREATE_STAMP\`, \`CREATED_BY\`, \`IS_DELETED\`, \`IS_SYSTEM\`)\r\nSELECT '${LookupCode}', '${code}', NULL,NULL, 0, SYSDATE(), 1, 0, 1\r\nWHERE NOT EXISTS (SELECT CODE from LOOKUPS_VALUES WHERE CODE = '${code}' AND LOOKUP_CODE = '${LookupCode}' );\n`;
      lookupStatements.push(lookupStatement);
    };

    const sqlStatement = `-- Lookups Value\r\n${lookupStatements.join('\n')}\n`;
    return sqlStatement;
  }

  generateOracleScripts(codes: string, LookupCode: string): string {
    const codesArr = codes.split("\n");
    const lookupStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i];
      const str = `DECLARE\r\n  V_COL_EXISTS NUMBER := 0; \r\nBEGIN\r\n    SELECT COUNT(*) INTO V_COL_EXISTS FROM LOOKUPS_VALUES WHERE CODE = '${code}' AND LOOKUP_CODE='${LookupCode}';\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n     INSERT INTO LOOKUPS_VALUES (LOOKUP_CODE, CODE, DESCRIPTION,DATA_MAPPING, EDITABLE, CREATE_STAMP, CREATED_BY, IS_DELETED, IS_SYSTEM)\r\n     VALUES ('${LookupCode}', '${code}', NULL,NULL, '1', SYSDATE, '1', '0', '0');\r\n    END IF;\r\nEND;\r\n/\r\n\r\n`;
      let lookupStatement = i === 0 ?
        `--Lookups Value\r\n${str}`
        :
        `${str}`;

      lookupStatements.push(lookupStatement);
    };

    const sqlStatement = `${lookupStatements.join('\n')}`;
    return sqlStatement;
  }

  generateSqlScripts(codes: string, LookupCode: string): string {
    const codesArr = codes.split("\n");
    const lookupStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i];
      const str = `SELECT @V_COL_EXISTS = COUNT(*) FROM LOOKUPS_VALUES WHERE CODE = '${code}' AND LOOKUP_CODE='${LookupCode}'\r\n\t\tIF( @V_COL_EXISTS = 0 ) BEGIN\r\n\t\t    INSERT INTO LOOKUPS_VALUES(LOOKUP_CODE, CODE, DESCRIPTION, DATA_MAPPING, EDITABLE, CREATE_STAMP, CREATED_BY, IS_DELETED, IS_SYSTEM)\r\n\t\tVALUES('${LookupCode}', '${code}', NULL, NULL, '0', GETDATE(), '1', '0', '1')\r\n\t\tEND`;
      let lookupStatement = i === 0 ?
        `\t\t${str}\n`
        : i === codesArr.length - 1 ?
          `\t\t${str}`
          :
          `\t\t${str}\n`;

      lookupStatements.push(lookupStatement);
    };

    const sqlStatement = `--Lookups Value\r\nDECLARE @V_COL_EXISTS INT\r\n\tBEGIN\r\n${lookupStatements.join('\n')}\nEND\n`;
    return sqlStatement;
  }
}
