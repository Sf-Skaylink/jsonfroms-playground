import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //private REST_API_SERVER = "http://localhost:3000/aws";

  constructor(private httpClient: HttpClient) { }

  public sendGetRequest ( server: string ) {
    return this.httpClient.get(server);
  }
}