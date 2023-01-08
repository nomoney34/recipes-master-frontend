import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.sass'],
})
export class CardComponent implements OnInit {
  @Input() name!: string;
  @Input() description!: string;
  @Input() ingredients!: string;
  @Input() instructions!: string;
  @Input() imageUrl!: string;

  constructor() {}

  ngOnInit(): void {}
}
