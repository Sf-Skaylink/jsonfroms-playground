import { Component, SimpleChanges  } from '@angular/core';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { and, createAjv, isControl, optionIs, rankWith, scopeEndsWith } from '@jsonforms/core';
import { RestEndPointControlRenderer, restEndPointControlTester } from './restEndPointControlRenderer';
import { DataDisplayComponent } from './data.control';
import { LangComponent } from './lang.control';
import uischemaAsset from '../assets/uischema.json';
import schemaAsset from '../assets/schema.json';
import dataAsset from './data';
import { parsePhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
} )
  
export class AppComponent {
  renderers = [
    ...angularMaterialRenderers,
    { tester: restEndPointControlTester, renderer: RestEndPointControlRenderer },
    {
      renderer: DataDisplayComponent,
      tester: rankWith(
        6,
        and(
          isControl,
          scopeEndsWith('___data')
        )
      )
    },
    {
      renderer: LangComponent,
      tester: rankWith(
        6,
        and(
          isControl,
          optionIs('lang', true)
        )
      )
    },
  ];
  uischema = uischemaAsset;
  schema = schemaAsset;
  data = dataAsset;
  i18n = {locale: 'de-DE'}
  ajv = createAjv({
    schemaId: 'id',
    allErrors: true
  } );
  
  initialData = {}

  constructor() {
    this.ajv.addFormat('time', '^([0-1][0-9]|2[0-3]):[0-5][0-9]$');
    this.ajv.addFormat('tel', maybePhoneNumber => {
      try {
        parsePhoneNumber(maybePhoneNumber, 'DE');
        return true;
      } catch (_) {
        return false;
      }
    } );
  }
}
