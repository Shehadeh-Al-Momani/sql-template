import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../../app.component';
import { DialogService } from '../dialog.service';

@Component({
  selector: 'permissions-scripts',
  templateUrl: './permissions.component.html'
})
export class PermissionsScriptsComponent implements OnInit {
  appCode: string;
  permissions: string;
  roles: string;
  enValues: string;
  arValues: string;
  deValues: string;
  frValues: string;
  translationType: string = 'Permissions';
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
      this.mySqlScript = this.generateMySqlScripts(this.appCode, this.permissions, this.roles);
      this.oraclrScript = this.generateOracleScripts(this.appCode, this.permissions, this.roles);
      this.sqlScript = this.generateSqlScripts(this.appCode, this.permissions, this.roles);
    }, 1000);
    setTimeout(() => { this.dialogRef.close({ save: true, mySqlScript: this.mySqlScript, oraclrScript: this.oraclrScript, sqlScript: this.sqlScript }); }, 1000);
  }

  close() {
    setTimeout(() => { this.dialogRef.close({ save: false }); }, 1000);
  }

  generateMySqlScripts(appCode: string, permissions: string, roles: string): string {
    const permissionsArr = !permissions ? [] : permissions.split("\n");
    const rolesArr = !roles ? [] : roles.split("\n");
    const insertStatements = [];

    for (let i = 0; i < permissionsArr.length; i++) {
      let permission = permissionsArr[i] ?? null;
      let insertStatement = `INSERT INTO \`PERMISSIONS\`(\`APP_ID\`,\`CODE\`,\`CREATE_STAMP\`,\`CREATED_BY\`,\`UPDATE_STAMP\`,\`UPDATED_BY\`,\`IS_DELETED\`,\`IS_SYSTEM\`,\`IS_ACTIVE\`) \r\nSELECT * FROM (SELECT @APP_ID AS \`APP_ID\`, '${permission}', CURRENT_TIMESTAMP, '1' AS \`CREATED_BY\`,\r\nNULL AS \`UPDATE_STAMP\`, NULL AS \`UPDATED_BY\`,'0' AS \`IS_SYSTEM\`, '0'AS \`IS_ACTIVE\`,'1') AS Temp\r\nWHERE NOT EXISTS (SELECT \`CODE\` FROM PERMISSIONS WHERE \`CODE\`='${permission}' AND APP_ID = @APP_ID) LIMIT 1;\n`;
      insertStatements.push(insertStatement);
    };

    if (rolesArr.length > 0) {
      for (let i = 0; i < rolesArr.length; i++) {
        let role = rolesArr[i] ?? null;
        for (let j = 0; j < permissionsArr.length; j++) {
          let permission = permissionsArr[j] ?? null;
          let insertStatement = `${i == 0 && j == 0 ?  `-- ASSIGN PRMISSIONS TO ROLE\r\n` : ``}INSERT INTO \`ROLE_PERMISSIONS\`(\`PERMISSION_ID\`,\`ROLE_ID\`,\`CREATE_STAMP\`,\`CREATED_BY\`)\r\nSELECT * FROM (\r\n\tSELECT (SELECT PERMISSION_ID  FROM PERMISSIONS WHERE CODE= '${permission}' AND APP_ID = @APP_ID) AS PERMISSION_ID,\r\n    (SELECT ROLE_ID FROM ROLES WHERE CODE= '${role}' AND APP_ID = @APP_ID) AS ROLE_ID , CURRENT_TIMESTAMP, 1) AS Temp\r\nWHERE NOT EXISTS (SELECT \`PERMISSION_ID\` , \`ROLE_ID\` FROM ROLE_PERMISSIONS WHERE \`PERMISSION_ID\` = (SELECT PERMISSION_ID  FROM PERMISSIONS WHERE CODE= '${permission}' AND APP_ID = @APP_ID)\r\nAND ROLE_ID = (SELECT ROLE_ID FROM ROLES WHERE CODE= '${role}' AND APP_ID = @APP_ID)) LIMIT 1;\n`;
          insertStatements.push(insertStatement);
        };
      };
    }

    const permissionsSql = `SET @APP_ID = (SELECT APP_ID FROM APPS WHERE CODE = '${appCode}');\r\n\r\n-- Create Permission\r\n${insertStatements.join('\n')}\n\n`;
    const translations = this.generateMySqlTranslations(this.permissions, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = permissionsSql + translations;
    return sqlStatement;
  }

  generateOracleScripts(appCode: string, permissions: string, roles: string): string {
    const permissionsArr = !permissions ? [] : permissions.split("\n");
    const rolesArr = !roles ? [] : roles.split("\n");
    const insertStatements = [];

    for (let i = 0; i < permissionsArr.length; i++) {
      let permission = permissionsArr[i] ?? null;
      let insertStatement = `DECLARE\r\n  V_PERMISSION_ID NUMBER;\r\n  P_APP_ID NUMBER ;\r\nBEGIN\r\nSELECT APP_ID INTO P_APP_ID FROM APPS WHERE CODE = '${appCode}';\r\n\r\nSELECT COUNT(*) into V_PERMISSION_ID FROM PERMISSIONS WHERE CODE = '${permission}' AND APP_ID = P_APP_ID;\r\nIF ( V_PERMISSION_ID = 0 ) THEN\r\nINSERT INTO PERMISSIONS (APP_ID, CODE, CREATE_STAMP, CREATED_BY,UPDATE_STAMP,UPDATED_BY,IS_DELETED,IS_SYSTEM,IS_ACTIVE)\r\nVALUES (P_APP_ID, '${permission}', SYSDATE,1, NULL, NULL, 0, 0, 1 );\r\n END IF; \r\nEND;\r\n/\n`;
      insertStatements.push(insertStatement);
    };

    if (rolesArr.length > 0) {
      for (let i = 0; i < rolesArr.length; i++) {
        let role = rolesArr[i] ?? null;
        for (let j = 0; j < permissionsArr.length; j++) {
          let permission = permissionsArr[j] ?? null;
          let insertStatement = `${i == 0 && j == 0 ?  `-- ASSIGN PRMISSIONS TO ROLE\r\n` : ``}DECLARE\r\n  V_COL_EXISTS NUMBER := 0;\r\n  V_ROLE_ID NUMBER;\r\n  V_PERMISSION_ID NUMBER;\r\n  P_APP_ID NUMBER ;\r\nBEGIN\r\n    SELECT APP_ID INTO P_APP_ID FROM APPS WHERE CODE = '${appCode}';\r\n    SELECT ROLE_ID INTO V_ROLE_ID FROM ROLES WHERE CODE= '${role}' AND APP_ID = P_APP_ID;\r\n\r\n    SELECT PERMISSION_ID INTO V_PERMISSION_ID FROM PERMISSIONS WHERE CODE = '${permission}' AND APP_ID = P_APP_ID;\r\n    SELECT COUNT(*) INTO V_COL_EXISTS FROM ROLE_PERMISSIONS WHERE ROLE_PERMISSIONS.PERMISSION_ID = V_PERMISSION_ID AND ROLE_PERMISSIONS.ROLE_ID=V_ROLE_ID;\r\n    IF ( V_COL_EXISTS = 0 ) THEN\r\n    INSERT INTO ROLE_PERMISSIONS (PERMISSION_ID,ROLE_ID, CREATE_STAMP,CREATED_BY) \r\n    VALUES (V_PERMISSION_ID, V_ROLE_ID, SYSDATE, 1);\r\n    END IF; \r\n END;\r\n /\n`;
          insertStatements.push(insertStatement);
        };
      };
    }

    const permissionsSql = `-- Create Permission\r\n${insertStatements.join('\n')}\n\n`;
    const translations = this.generateOracleTranslations(this.permissions, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = permissionsSql + translations;
    return sqlStatement;
  }

  generateSqlScripts(appCode: string, permissions: string, roles: string): string {
    const permissionsArr = !permissions ? [] : permissions.split("\n");
    const rolesArr = !roles ? [] : roles.split("\n");
    const insertStatements = [];

    for (let i = 0; i < permissionsArr.length; i++) {
      let permission = permissionsArr[i] ?? null;
      let insertStatement = `IF NOT EXISTS(SELECT * FROM PERMISSIONS WITH(NOLOCK) WHERE [CODE] = '${permission}')\r\nBEGIN\r\n    INSERT [dbo].[PERMISSIONS] ([APP_ID], [CODE], [CREATE_STAMP], [CREATED_BY],[UPDATE_STAMP],[UPDATED_BY],[IS_DELETED],[IS_SYSTEM],[IS_ACTIVE])\r\n      VALUES (@APP_ID,'${permission}',CURRENT_TIMESTAMP,1,NULL,NULL,0,0,1)\r\nEND\n`;
      insertStatements.push(insertStatement);
    };

    if (rolesArr.length > 0) {
      for (let i = 0; i < rolesArr.length; i++) {
        let role = rolesArr[i] ?? null;
        let assignToRolesStatements = [];

        for (let j = 0; j < permissionsArr.length; j++) {
          let permission = permissionsArr[j] ?? null;
          let insertStatement = `SET @PERMISSION_ID =(SELECT PERMISSION_ID FROM PERMISSIONS WHERE CODE= '${permission}' AND APP_ID = @APP_ID)\r\nIF NOT EXISTS(SELECT * FROM ROLE_PERMISSIONS WITH(NOLOCK) WHERE [ROLE_ID] = @ROLE_ID AND [PERMISSION_ID] = @PERMISSION_ID )\r\nBEGIN\r\n    INSERT [dbo].[ROLE_PERMISSIONS] ([PERMISSION_ID], [ROLE_ID], [CREATE_STAMP], [CREATED_BY])\r\n      VALUES (@PERMISSION_ID,@ROLE_ID,CURRENT_TIMESTAMP,1)\r\nEND\n`;
          assignToRolesStatements.push(insertStatement);
        };

        assignToRolesStatements[0] = `${i == 0 ?  `-- ASSIGN PRMISSIONS TO ROLE\r\n` : ``}SET @ROLE_ID = (SELECT ROLE_ID FROM ROLES WHERE CODE = '${role}' AND APP_ID = @APP_ID)\r\n\r\n${assignToRolesStatements[0]}`;
        insertStatements.push(`${assignToRolesStatements.join('\n')}`);
        assignToRolesStatements = [];
      };
    }

    const permissionsSql = `DECLARE @APP_ID INT\r\nDECLARE @ROLE_ID INT\r\nDECLARE @PERMISSION_ID INT\r\n\r\nSET @APP_ID =(SELECT APP_ID FROM APPS WHERE CODE = '${appCode}')\r\n\r\n--CREATE PERMISIION\r\n${insertStatements.join('\n')}\n\n`;
    const translations = this.generateSqlTranslations(this.permissions, this.enValues, this.arValues, this.deValues, this.frValues);

    const sqlStatement = permissionsSql + translations;
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
