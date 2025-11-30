import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Search} from '../../services/search';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./search.html',
  styleUrls: ['./search.css']
})
export class SearchShared implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Rechercher...';
  @Input() searchTerm: string = '';
  @Input() showFilters: boolean = false;
  @Input() showPriceFilter: boolean = false;
  @Input() filters: any = {};
 @Output() searchChange = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<string>();

  private searchSubscription!: Subscription;

  constructor(private searchService: Search) {}

  ngOnInit() {
    // Écouter les recherches globales
    this.searchSubscription = this.searchService.currentSearchTerm.subscribe(term => {
      this.searchTerm = term;
      this.searchChange.emit(term);
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchInput(event: any) {
    const term = event.target.value;
    this.searchTerm = term;
    this.searchChange.emit(term);
    this.searchService.updateSearchTerm(term);
  }
  onSelectChange(filterName: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target?.value || '';
    this.onFilterChange(filterName, value);
  }

  onFilterChange(filterName: string, value: any) {
    this.filters[filterName] = value;
    this.filtersChange.emit(this.filters);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChange.emit('');
    this.searchService.updateSearchTerm('');
  }
}