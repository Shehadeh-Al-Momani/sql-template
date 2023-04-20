import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../../app.component';
import { DialogService } from '../dialog.service';

@Component({
  selector: 'translations-scripts',
  templateUrl: './translations.component.html'
})
export class TranslationsScriptsComponent implements OnInit {
  translationType: string;
  codes: string;
  enValues: string;
  arValues: string;
  deValues: string;
  frValues: string;
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
      this.mySqlScript = this.generateMySqlScripts(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);
      this.oraclrScript = this.generateOracleScripts(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);
      this.sqlScript = this.generateSqlScripts(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);
    }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateMySqlScripts(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
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

  generateOracleScripts(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
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

  generateSqlScripts(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
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
  END;\n`;

        sqlStatements.push(sqlStatement);
      }
    };

    return `-- Translation\r\n${sqlStatements.join('\n')}`;
  }
}
