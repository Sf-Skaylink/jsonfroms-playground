import { ChangeDetectionStrategy, Component, Input, SimpleChanges  } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import {
  Actions,
  composeWithUi,
  ControlElement,
  OwnPropsOfControl,
  isOneOfEnumControl,
  RankedTester,
  rankWith
} from '@jsonforms/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import { DataService } from './data.service';

@Component({
  selector: 'RestEndPointControlRenderer',
  template: `
    <mat-form-field fxFlex [fxHide]="hidden">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        type="text"
        (change)="onChange($event)"
        [id]="id"
        [formControl]="form"
        [matAutocomplete]="auto"
        (keydown)="updateFilter($event)"
      />
      <mat-autocomplete
        autoActiveFirstOption
        #auto="matAutocomplete"
        [displayWith]="displayFn"
        (optionSelected)="onSelect($event)"
      >
        <mat-option
          *ngFor="let option of filteredOptions | async"
          [value]="option.value || option.const"
        >
          {{ option.displayValue || option.title }}
        </mat-option>
      </mat-autocomplete>
      <mat-hint *ngIf="shouldShowUnfocusedDescription()">{{ description }}</mat-hint>
      <mat-error>{{ error }}</mat-error>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestEndPointControlRenderer extends JsonFormsControl {
  @Input() options: string[];
  filteredOptions: Observable<string[]>;
  shouldFilter: boolean;
  restData: string[] = [];
  sub: string;
  result: any;

  constructor(jsonformsService: JsonFormsAngularService, private dataService: DataService) {
    super(jsonformsService);
  }
  getEventValue = (event: any) => event.target.value;
  
  async ngOnInit() {
    super.ngOnInit();
    this.shouldFilter = false
    if (this.scopedSchema.oneOf["0"]["apiEndpoint"]) {
      await this.getData( this.scopedSchema.oneOf[ "0" ][ "apiEndpoint" ] );
    }
    this.filteredOptions = this.form.valueChanges.pipe(
      startWith(''),
      map(val => this.filter(val))
    );
  }

  ngOnChanges ( changes: SimpleChanges ) {
    console.log("onchange",changes)
  }

  updateFilter(event: any) {
    if (event.keyCode === 13) {
      this.shouldFilter = false;
    } else {
      this.shouldFilter = true;
    }
  }

  onSelect ( ev: MatAutocompleteSelectedEvent ) {
    const path = composeWithUi(this.uischema as ControlElement, this.path);
    this.shouldFilter = false;
    this.jsonFormsService.updateCore( Actions.update( path, () => ev.option.value ) );
    this.triggerValidation();
  }

  filter ( val: string ): string[] {
    let values = this.scopedSchema.oneOf["0"]["apiEndpoint"] ? this.filterEndpointResults() : this.scopedSchema.oneOf
    return (this.options || this.scopedSchema.enum || values || []).filter(
      option =>
        !this.shouldFilter ||
        !val ||
        option.toLowerCase().indexOf(val.toLowerCase()) === 0
    );
  }

  displayFn = value => {
    if ( value ) {
      this.result = this.filter( value ).find( x => x[ "value" ] === value )
      return this.result["displayValue"]
    }
  }

  async getData ( apiEndpoint: string ) {
    // Baseurl and query implementation
    this.dataService.sendGetRequest(apiEndpoint).subscribe( ( data: any ) => {
      this.restData = data[ "oneOf" ];
    } )
  }

  filterEndpointResults () {
    if (this.jsonFormsService.getState().jsonforms.core.data.orders[ 0 ].customer[ this.scopedSchema.oneOf[ "0" ][ "dependsOn" ] ]) {
      return this.restData.filter( x => x["filterId"] === this.jsonFormsService.getState().jsonforms.core.data.orders[ 0 ].customer[ this.scopedSchema.oneOf[ "0" ][ "dependsOn" ] ] )
    }
    return this.restData
  }

  // Todo Mapping of the rest endpoints results into a oneOF
  mapResults ( results: any[] ) {
    return results.map( x => {
      return {
        oneOf: [ { ...x } ]
        }
    } )
  }
  
  protected getOwnProps(): OwnPropsOfAutoComplete {
    return {
      ...super.getOwnProps(),
      options: this.options
    };
  }
}

export const restEndPointControlTester: RankedTester = rankWith(
  3, isOneOfEnumControl
);

interface OwnPropsOfAutoComplete extends OwnPropsOfControl {
  options: string[];
}