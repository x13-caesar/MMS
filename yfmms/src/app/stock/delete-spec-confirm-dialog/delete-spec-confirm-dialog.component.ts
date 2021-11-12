import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SpecService} from '../../shared/services/spec.service';
import {Spec} from '../../shared/models/spec';
import {Compo} from '../../shared/models/compo';

class DialogData {
  spec!: Spec;
  compo!: Compo
}

@Component({
  selector: 'app-delete-spec-confirm-dialog',
  templateUrl: './delete-spec-confirm-dialog.component.html',
  styleUrls: ['./delete-spec-confirm-dialog.component.scss']
})
export class DeleteSpecConfirmDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteSpecConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private specService: SpecService,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  onConfirmDelete(): void {
    this.specService.deleteSpec(String(this.data.spec.id)).subscribe(
      res => {
        this.dialogRef.close(res);
      },
      error => this._snackBar.open(`删除失败`, "关闭")
    )
  }

}
