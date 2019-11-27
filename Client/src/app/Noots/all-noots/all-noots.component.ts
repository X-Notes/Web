import { Component, OnInit } from '@angular/core';
import { NootsService } from 'src/app/Services/noots.service';
import { Noot } from 'src/app/Models/Noots/Noot';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-noots',
  templateUrl: './all-noots.component.html',
  styleUrls: ['./all-noots.component.sass']
})
export class AllNootsComponent implements OnInit {

  noots: Noot[];
  unsubscribe = new Subject();
  constructor(private nootService: NootsService, private router: Router) { }

  ngOnInit() {
    setTimeout(() => this.nootService.GetAll().pipe(takeUntil(this.unsubscribe))
    .subscribe(x => this.noots = x
      , error => console.log(error)), 400);

  }
  OpenNoot(id: string) {
    this.router.navigate(['/noots', id]);
  }
}

