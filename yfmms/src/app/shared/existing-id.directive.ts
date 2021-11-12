/** A hero's name can't match the given regular expression */
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function existingIdValidator(ids: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const duplicated = ids.find(id => id === control.value);
    return duplicated ? {existing: {value: control.value}} : null;
  };
}
