import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class DialogService {
    constructor(private dialog: MatDialog) { }

    public modal(modalComponent: any, modalData: any): Observable<any> {
        let dialogRef = this.dialog.open(modalComponent, {
            width: '250px',
            data: modalData
        });

        return dialogRef.afterClosed();
    }
}
