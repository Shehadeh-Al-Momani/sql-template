import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'oracleHighlight'
})
export class OracleHighlightPipe implements PipeTransform {
  transform(value: string): string {
    const sqlKeywords = [
      'ADD',
      'ALL',
      'ALTER',
      'AND',
      'ANY',
      'AS',
      'ASC',
      'BACKUP',
      'BETWEEN',
      'BY',
      'CASE',
      'CHECK',
      'COLUMN',
      'CONSTRAINT',
      'CREATE',
      'DATABASE',
      'DEFAULT',
      'DELETE',
      'DESC',
      'DISTINCT',
      'DROP',
      'EXECUTE',
      'EXISTS',
      'FOREIGN',
      'FROM',
      'FULL',
      'FUNCTION',
      'GROUP',
      'HAVING',
      'IN',
      'INDEX',
      'INNER',
      'INSERT',
      'INTO',
      'IS',
      'JOIN',
      'KEY',
      'LEFT',
      'LIKE',
      'NOT',
      'NULL',
      'ON',
      'OPTION',
      'OR',
      'ORDER',
      'OUTER',
      'PRIMARY',
      'PROCEDURE',
      'REFERENCES',
      'RIGHT',
      'ROLLBACK',
      'SELECT',
      'SET',
      'TABLE',
      'TOP',
      'TRUNCATE',
      'UNION',
      'UNIQUE',
      'UPDATE',
      'VALUES',
      'VIEW',
      'WHERE',
      'WITH'
    ];

    let html = '';
    let inString = false;

    for (let i = 0; i < value.length; i++) {
      const char = value.charAt(i);

      if (char.match(/[A-Z]/)) {
        html += `<span class="keyword">${char}</span>`;
      } else if (char.match(/['"]/)) {
        html += `<span class="string">${char}`;
        inString = true;
      } else if (inString && char.match(/[^\w\s]/)) {
        html += `${char}</span>`;
        inString = false;
      } else if (char.match(/[0-9]/)) {
        html += `<span class="number">${char}</span>`;
      } else {
        html += char;
      }
    }

    return html;
  }
}
