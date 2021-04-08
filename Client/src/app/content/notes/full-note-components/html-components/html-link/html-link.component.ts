import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-html-link',
  templateUrl: './html-link.component.html',
  styleUrls: ['./html-link.component.scss'],
})
export class HtmlLinkComponent implements OnInit {
  @Input() link: string;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        Authorization: '',
      }),
      withCredentials: false,
    };
    const data = this.httpClient.get<any>(this.link, httpOptions);
    data.subscribe((x) => {
      console.log(x);
    });
  }
}
