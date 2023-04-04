import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../../app.component';
import { DialogService } from '../dialog.service';

@Component({
  selector: 'system-menus-scripts',
  templateUrl: './system-menus.component.html'
})
export class SystemMenusScriptsComponent implements OnInit {
  moduleCode: string;
  codes: string;
  routes: string;
  parentCodes: string;
  sequences: string;
  permissions: string;
  enValues: string;
  arValues: string;
  deValues: string;
  frValues: string;
  translationType: string = 'SystemMenus';
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
      this.mySqlScript = this.generateMySqlScripts(this.moduleCode, this.codes, this.routes, this.parentCodes, this.sequences, this.permissions);
      this.oraclrScript = this.generateOracleScripts(this.moduleCode, this.codes, this.routes, this.parentCodes, this.sequences, this.permissions);
      this.sqlScript = this.generateSqlScripts(this.moduleCode, this.codes, this.routes, this.parentCodes, this.sequences, this.permissions);
    }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateMySqlScripts(moduleCode: string, codes: string, routes: string, parentCodes: string, sequences: string, permissions: string): string {
    const codesArr = codes.split("\n");
    const routesArr = !routes ? [] : routes.split("\n");
    const parentCodesArr = !parentCodes ? [] : parentCodes.split("\n");
    const sequencesArr = !sequences ? [] : sequences.split("\n");
    const permissionsArr = !permissions ? [] : permissions.split("\n");
    const systemMenusStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i];
      let route = routesArr[i] ?? null;
      let parentCode = parentCodesArr[i] ?? null;
      let sequence = sequencesArr[i] ?? null;
      let permission = permissionsArr[i] ?? null;
      let lookupStatement = `INSERT INTO \`SYSTEM_MENUS\` (\`CODE\`,\`ROUTE\`,\`PARENT_CODE\`,\`MODULE_CODE\`,\`SEQUENCE\`,\`PERMISSIONS\`)\r\nSELECT '${code}', ${route} ,${parentCode} ,'${moduleCode}','${sequence}','${permission}'\r\nWHERE NOT EXISTS (SELECT CODE FROM SYSTEM_MENUS WHERE CODE = '${code}' );\n`;
      systemMenusStatements.push(lookupStatement);
    };

    const systemMenus = `-- Add System_Menus\r\n${systemMenusStatements.join('\n')}\n\n`;
    const translations = this.generateMySqlTranslations(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = systemMenus + translations;
    return sqlStatement;
  }

  generateOracleScripts(moduleCode: string, codes: string, routes: string, parentCodes: string, sequences: string, permissions: string): string {
    const codesArr = codes.split("\n");
    const routesArr = !routes ? [] : routes.split("\n");
    const parentCodesArr = !parentCodes ? [] : parentCodes.split("\n");
    const sequencesArr = !sequences ? [] : sequences.split("\n");
    const permissionsArr = !permissions ? [] : permissions.split("\n");
    const systemMenusStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i] ?? null;
      let route = routesArr[i] ?? null;
      let parentCode = parentCodesArr[i] ?? null;
      let sequence = sequencesArr[i] ?? null;
      let permission = permissionsArr[i] ?? null;
      const str = `DECLARE\r\n  V_COL_EXISTS NUMBER := 0; \r\nBEGIN\r\n    SELECT COUNT(*) INTO V_COL_EXISTS FROM SYSTEM_MENUS WHERE SYSTEM_MENUS.CODE = '${code}';\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n    INSERT INTO SYSTEM_MENUS (CODE, ROUTE, PARENT_CODE, MODULE_CODE, SEQUENCE, PERMISSIONS) \r\n    VALUES ('${code}', ${route}, ${parentCode}, '${moduleCode}','${sequence}','${permission}');\r\n    END IF;\r\nEND;\r\n/\n`;
      let lookupStatement = i === 0 ?
        `-- Add System_Menus\r\n${str}`
        :
        `${str}`;

      systemMenusStatements.push(lookupStatement);
    };

    const systemMenus = `${systemMenusStatements.join('\n')}\n`;
    const translations = this.generateOracleTranslations(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = systemMenus + translations;
    return sqlStatement;
  }

  generateSqlScripts(moduleCode: string, codes: string, routes: string, parentCodes: string, sequences: string, permissions: string): string {
    const codesArr = codes.split("\n");
    const routesArr = !routes ? [] : routes.split("\n");
    const parentCodesArr = !parentCodes ? [] : parentCodes.split("\n");
    const sequencesArr = !sequences ? [] : sequences.split("\n");
    const permissionsArr = !permissions ? [] : permissions.split("\n");
    const systemMenusStatements = [];

    for (let i = 0; i < codesArr.length; i++) {
      let code = codesArr[i] ?? null;
      let route = routesArr[i] ?? null;
      let parentCode = parentCodesArr[i] ?? null;
      let sequence = sequencesArr[i] ?? null;
      let permission = permissionsArr[i] ?? null;
      let lookupStatement = `IF NOT EXISTS(SELECT * FROM SYSTEM_MENUS WITH(NOLOCK) WHERE [CODE] = '${code}')\r\nBEGIN\r\n    INSERT [dbo].[SYSTEM_MENUS] \r\n                 ([CODE], [ROUTE], [PARENT_CODE], [MODULE_CODE], [SEQUENCE], [PERMISSIONS])\r\n     VALUES ('${code}', ${route}, ${parentCode}, '${moduleCode}','${sequence}','${permission}')\r\nEND\n`;
      systemMenusStatements.push(lookupStatement);
    };

    const systemMenus = `-- Add System_Menus\r\n${systemMenusStatements.join('\n')}\n\n`;
    const translations = this.generateSqlTranslations(this.codes, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = systemMenus + translations;
    return sqlStatement;
  }

  generateMySqlTranslations(codes: string, enValues: string, arValues: string, deValues: string, frValues: string): string {
    const codesArr = codes.split("\n");
    const languages = ['en', 'ar', 'de', 'fr'];
    const values = {
      'en': enValues.split("\n"),
      'ar': arValues.split("\n"),
      'de': deValues.split("\n"),
      'fr': frValues.split("\n")
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
      'en': enValues.split("\n"),
      'ar': arValues.split("\n"),
      'de': deValues.split("\n"),
      'fr': frValues.split("\n")
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
      'en': enValues.split("\n"),
      'ar': arValues.split("\n"),
      'de': deValues.split("\n"),
      'fr': frValues.split("\n")
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
