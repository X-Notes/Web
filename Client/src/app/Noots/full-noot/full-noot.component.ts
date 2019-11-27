import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FullNoot } from 'src/app/Models/Noots/FullNoot';
import { NootsService } from 'src/app/Services/noots.service';

@Component({
  selector: 'app-full-noot',
  templateUrl: './full-noot.component.html',
  styleUrls: ['./full-noot.component.sass']
})
export class FullNootComponent implements OnInit {

  html;
  private fullNoot: FullNoot;
  private id: string;
  private subscription: Subscription;
  constructor(private activateRoute: ActivatedRoute, private nootService: NootsService) {
    this.subscription = activateRoute.params.subscribe(params => this.id = params.id);
  }

  ngOnInit() {
    this.nootService.GetFullNoot(this.id).subscribe(x => {console.log(x);
                                                          this.html = x.description;
                                                          this.fullNoot = x;
    });
  }

}
