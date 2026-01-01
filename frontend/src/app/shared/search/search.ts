import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchShared {
  @Input() placeholder = 'Rechercher...';
  @Output() searchChange = new EventEmitter<string>();

  term = '';

  onTermChange() {
    this.searchChange.emit(this.term.trim());
  }

  clearSearch() {
    this.term = '';
    this.searchChange.emit('');
  }
}
