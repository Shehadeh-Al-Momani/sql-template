import { NgModule } from '@angular/core';
import { MySqlHighlightPipe } from './my-sql-highlight.pipe';
import { OracleHighlightPipe } from './oracle-highlight.pipe';
import { SqlHighlightPipe } from './sql-highlight.pipe';

@NgModule({
    declarations: [
      MySqlHighlightPipe,
      OracleHighlightPipe,
      SqlHighlightPipe
    ],
    exports: [
      MySqlHighlightPipe,
      OracleHighlightPipe,
      SqlHighlightPipe
    ]
})
export class PipesModule { }
