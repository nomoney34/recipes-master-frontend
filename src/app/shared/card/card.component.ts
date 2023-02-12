import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../models/user';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.sass'],
})
export class CardComponent implements OnInit {
  @Input() id!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() ingredients!: string;
  @Input() instructions!: string;
  @Input() imageUrl!: string;
  @Input() user!: User;

  @Output() navigate = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  toDetails(id: string) {
    this.navigate.emit(id);
  }
}
