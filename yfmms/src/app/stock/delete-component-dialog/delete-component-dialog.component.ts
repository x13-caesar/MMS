import {Component, Inject, OnInit} from '@angular/core';
import {CompoService} from '../../shared/services/compo.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Compo} from '../../shared/models/compo';

class DialogData {
  compo!: Compo
}

@Component({
  selector: 'app-delete-component-dialog',
  templateUrl: './delete-component-dialog.component.html',
  styleUrls: ['./delete-component-dialog.component.scss']
})
export class DeleteComponentDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private compoService: CompoService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  onConfirmDelete(): void {
    this.compoService.deleteCompo(String(this.data.compo.id)).subscribe(
      res => this.dialogRef.close(res),
      error => this._snackBar.open(`删除失败`, "关闭")
    )
  }

}
