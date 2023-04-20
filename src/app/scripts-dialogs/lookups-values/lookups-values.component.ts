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
  enValues: string;
  arValues: string;
  deValues: string;
  frValues: string;
  translationType: string = 'Lookups';
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

    const lookups = `-- Lookups\r\nINSERT INTO \`LOOKUPS\` (\`CODE\`,\`PARENT_CODE\`,\`CREATE_STAMP\`,\`CREATED_BY\`,\`IS_DELETED\`,\`IS_SYSTEM\`)\r\nSELECT '${LookupCode}', NULL, SYSDATE(), 1, 0, 1\r\nWHERE NOT EXISTS (SELECT \`CODE\` from LOOKUPS WHERE \`CODE\` = '${LookupCode}' );\r\n\r\n`;
    const lookupsValues = `-- Lookups Value\r\n${lookupStatements.join('\n')}\n\n`;
    const translations = this.generateMySqlTranslations(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = lookups + lookupsValues + translations;
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

    const lookups = `--Lookups\r\nDECLARE\r\n  V_COL_EXISTS NUMBER := 0; \r\n\r\nBEGIN\r\n    SELECT COUNT(*) into V_COL_EXISTS FROM LOOKUPS WHERE CODE= '${LookupCode}';\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n        INSERT INTO LOOKUPS (CREATE_STAMP, CREATED_BY, UPDATE_STAMP, UPDATED_BY, IS_DELETED, IS_SYSTEM, CODE, PARENT_CODE) \r\n        VALUES (SYSDATE, 1, NULL, NULL, 0, 1, '${LookupCode}', NULL);\r\n    END IF; \r\n END;\r\n /\r\n\r\n`;
    const lookupsValues = `${lookupStatements.join('\n')}\n`;
    const translations = this.generateOracleTranslations(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = lookups + lookupsValues + translations;
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

    const lookups = `--Lookups\r\nIF NOT EXISTS(SELECT * FROM LOOKUPS WITH(NOLOCK) WHERE [CODE] = '${LookupCode}')\r\nBEGIN\r\n\t\tINSERT INTO  LOOKUPS  (CODE, PARENT_CODE, CREATE_STAMP, CREATED_BY, IS_DELETED, IS_SYSTEM) \r\n\t\tVALUES ('${LookupCode}', NULL, GETDATE(), '1', '0', '1')\r\nEND\r\n\r\n`;
    const lookupsValues = `--Lookups Value\r\nDECLARE @V_COL_EXISTS INT\r\n\tBEGIN\r\n${lookupStatements.join('\n')}\nEND\n\n\n`;
    const translations = this.generateSqlTranslations(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = lookups + lookupsValues + translations;
    return sqlStatement;
  }

  generateMySqlTranslations(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
    const codesArr = codes.split("\n");
    const languages = ['en', 'ar', 'de', 'fr'];
    const values = {
      'en': enValues?.split("\n"),
      'ar': arValues?.split("\n"),
      'de': deValues?.split("\n"),
      'fr': frValues?.split("\n")
    };
    const sqlStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      for (let j = 0; j < languages.length; j++) {
        const translationType = this.translationType;
        const code = codesArr[i];
        const langCode = languages[j];
        const langValue = values[langCode][i];

        const str = `INSERT INTO \`TRANSLATION\` (\`VALUE\`,\`LANGUAGE_CODE\`,\`CODE\`,\`TYPE\`)\r\nSELECT ${langCode === 'ar' ? 'N' : ''}'${langValue}','${langCode}', '${code}' , '${translationType}'\r\nWHERE NOT EXISTS (SELECT \`CODE\` FROM \`TRANSLATION\` WHERE \`TYPE\`='${translationType}' AND \`CODE\` = '${code}' AND LANGUAGE_CODE ='${langCode}') LIMIT 1;`;
        let sqlStatement = j === languages.length - 1 ? `${str}\n\n` : `${str}\n`;

        sqlStatements.push(sqlStatement);
      }
    };

    return `-- Translation\r\n${sqlStatements.join('\n')}`;
  }

  generateOracleTranslations(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
    const codesArr = codes.split("\n");
    const languages = ['en', 'ar', 'de', 'fr'];
    const values = {
      'en': enValues?.split("\n"),
      'ar': arValues?.split("\n"),
      'de': deValues?.split("\n"),
      'fr': frValues?.split("\n")
    };
    const sqlStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let translationStatements = [];
      for (let j = 0; j < languages.length; j++) {
        const code = codesArr[i];
        const langCode = languages[j];
        const langValue = values[langCode][i];
        const translationType = this.translationType;

        let translationStatement = j === 0 ?
          `SELECT COUNT(*) INTO V_COL_EXISTS FROM TRANSLATION WHERE TRANSLATION.CODE = '${code}' AND LANGUAGE_CODE = '${langCode}' AND TYPE ='${translationType}';\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n    INSERT INTO TRANSLATION (VALUE, LANGUAGE_CODE, CODE, TYPE) \r\n    VALUES (${langCode === 'ar' ? 'N' : ''}'${langValue}', '${langCode}', '${code}', '${translationType}');\r\n    END IF;`
          :
          `\r\n    SELECT COUNT(*) INTO V_COL_EXISTS FROM TRANSLATION WHERE TRANSLATION.CODE = '${code}' AND LANGUAGE_CODE = '${langCode}' AND TYPE ='${translationType}';\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n    INSERT INTO TRANSLATION (VALUE, LANGUAGE_CODE, CODE, TYPE) \r\n    VALUES (${langCode === 'ar' ? 'N' : ''}'${langValue}', '${langCode}', '${code}', '${translationType}');\r\n    END IF;`;

        translationStatements.push(translationStatement);
      };

      const sqlStatement = i === 0 ?
        `-- Translation\r\nDECLARE\r\n  V_COL_EXISTS NUMBER := 0; \r\nBEGIN\r\n    ${translationStatements.join('\n')}\r\nEND;\r\n/`
        :
        `\nDECLARE\r\n  V_COL_EXISTS NUMBER := 0; \r\nBEGIN\r\n    ${translationStatements.join('\n')}\r\nEND;\r\n/`;
      sqlStatements.push(sqlStatement);
    };

    return sqlStatements.join('\n');
  }

  generateSqlTranslations(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
    const codesArr = codes.split("\n");
    let languages = ['en', 'ar', 'de', 'fr'];
    let values = {
      'en': enValues?.split("\n"),
      'ar': arValues?.split("\n"),
      'de': deValues?.split("\n"),
      'fr': frValues?.split("\n")
    };
    const sqlStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      for (let j = 0; j < languages.length; j++) {
        let translationType = this.translationType;
        let code = codesArr[i];
        let langCode = languages[j];
        let langValue = values[langCode][i];

        let sqlStatement = j === languages.length - 1 ?
          `IF NOT EXISTS(SELECT * FROM TRANSLATION WITH(NOLOCK) WHERE [CODE] = '${code}' AND LANGUAGE_CODE = '${langCode}' AND TYPE ='${translationType}')
  BEGIN
      INSERT [dbo].[TRANSLATION] ([VALUE], [LANGUAGE_CODE], [CODE], [TYPE])
        VALUES (${langCode === 'ar' ? 'N' : ''}'${langValue}','${langCode}', '${code}', '${translationType}')
  END\n\n`
          :
          `IF NOT EXISTS(SELECT * FROM TRANSLATION WITH(NOLOCK) WHERE [CODE] = '${code}' AND LANGUAGE_CODE = '${langCode}' AND TYPE ='${translationType}')
  BEGIN
      INSERT [dbo].[TRANSLATION] ([VALUE], [LANGUAGE_CODE], [CODE], [TYPE])
        VALUES (${langCode === 'ar' ? 'N' : ''}'${langValue}','${langCode}', '${code}', '${translationType}')
  END\n`;

        sqlStatements.push(sqlStatement);
      }
    };

    return `-- Translation\r\n${sqlStatements.join('\n')}`;
  }
}
