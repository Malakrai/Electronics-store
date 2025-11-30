/*import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchableItem {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  sku?: string;
  price?: number;
  stock?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class Search {
  private searchTermSource = new BehaviorSubject<string>('');
  currentSearchTerm = this.searchTermSource.asObservable();

  updateSearchTerm(term: string) {
    this.searchTermSource.next(term);
  }

  // Recherche générique réutilisable
  searchItems<T extends SearchableItem>(term: string, items: T[], fields: string[] = ['name', 'description', 'category']): T[] {
    if (!term.trim()) {
      return items;
    }

    const searchTerm = term.toLowerCase();
    
    return items.filter(item =>
      fields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm)
      )
    );
  }

  // Recherche spécifique produits
  searchProducts(term: string, products: any[]) {
    return this.searchItems(term, products, ['name', 'description', 'category', 'sku']);
  }

  // Recherche spécifique utilisateurs
  searchUsers(term: string, users: any[]) {
    return this.searchItems(term, users, ['firstName', 'lastName', 'email', 'role']);
  }
  // Recherche spécifique pour électronique
searchElectronics(term: string, products: any[]) {
  return this.searchItems(term, products, [
    'name', 
    'description', 
    'category', 
    'sku',
    'brand',
    'model'
  ]);
}

// Recherche par catégorie spécifique
searchByCategory(category: string, products: any[]) {
  if (!category) return products;
  return products.filter(product => product.category === category);
}

// Recherche avec filtres avancés électronique
advancedElectronicsSearch(
  products: any[],
  searchTerm: string,
  filters: {
    category?: string;
    priceRange?: string;
    brand?: string;
    inStock?: boolean;
    status?: string;
  } = {}
) {
  let results = this.searchElectronics(searchTerm, products);

  // Filtre par catégorie
  if (filters.category) {
    results = results.filter(p => p.category === filters.category);
  }

  // Filtre par prix
  if (filters.priceRange) {
    switch (filters.priceRange) {
      case '0-100':
        results = results.filter(p => p.price <= 100);
        break;
      case '100-500':
        results = results.filter(p => p.price > 100 && p.price <= 500);
        break;
      case '500-1000':
        results = results.filter(p => p.price > 500 && p.price <= 1000);
        break;
      case '1000+':
        results = results.filter(p => p.price > 1000);
        break;
    }
  }

  // Filtre stock
  if (filters.inStock) {
    results = results.filter(p => p.stock > 0);
  }

  // Filtre statut
  if (filters.status) {
    results = results.filter(p => p.status === filters.status);
  }

  return results;
}

  // Recherche avancée avec filtres
  advancedSearch<T extends SearchableItem>(
    items: T[], 
    searchTerm: string, 
    filters: { [key: string]: any } = {}
  ): T[] {
    let results = this.searchItems(searchTerm, items);
    
    // Appliquer les filtres supplémentaires
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        results = results.filter(item => 
          item[key]?.toString().toLowerCase() === filters[key]?.toString().toLowerCase()
        );
      }
    });
    
    return results;
  }
}*/


//normalement avec stzandalone
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchableItem {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  sku?: string;
  price?: number;
  stock?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root' 
})
export class Search { 
  private searchTermSource = new BehaviorSubject<string>('');
  currentSearchTerm = this.searchTermSource.asObservable();

  updateSearchTerm(term: string) {
    this.searchTermSource.next(term);
  }

  // Recherche générique réutilisable
  searchItems<T extends SearchableItem>(
    term: string, 
    items: T[], 
    fields: string[] = ['name', 'description', 'category']
  ): T[] {
    if (!term.trim()) {
      return items;
    }

    const searchTerm = term.toLowerCase();
    
    return items.filter(item =>
      fields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm)
      )
    );
  }

  // Recherche spécifique produits
  searchProducts(term: string, products: any[]) {
    return this.searchItems(term, products, ['name', 'description', 'category', 'sku']);
  }

  // Recherche spécifique utilisateurs
  searchUsers(term: string, users: any[]) {
    return this.searchItems(term, users, ['firstName', 'lastName', 'email', 'role']);
  }

  // Recherche spécifique pour électronique
  searchElectronics(term: string, products: any[]) {
    return this.searchItems(term, products, [
      'name', 
      'description', 
      'category', 
      'sku',
      'brand',
      'model'
    ]);
  }

  // Recherche par catégorie spécifique
  searchByCategory(category: string, products: any[]) {
    if (!category) return products;
    return products.filter(product => product.category === category);
  }

  // Recherche avec filtres avancés électronique
  advancedElectronicsSearch(
    products: any[],
    searchTerm: string,
    filters: {
      category?: string;
      priceRange?: string;
      brand?: string;
      inStock?: boolean;
      status?: string;
    } = {}
  ) {
    let results = this.searchElectronics(searchTerm, products);

    // Filtre par catégorie
    if (filters.category) {
      results = results.filter(p => p.category === filters.category);
    }

    // Filtre par prix
    if (filters.priceRange) {
      results = this.filterByPriceRange(results, filters.priceRange);
    }

    // Filtre stock
    if (filters.inStock) {
      results = results.filter(p => p.stock > 0);
    }

    // Filtre statut
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }

    return results;
  }

  // Méthode helper pour le filtrage par prix
  private filterByPriceRange(products: any[], priceRange: string) {
    switch (priceRange) {
      case '0-100':
        return products.filter(p => p.price <= 100);
      case '100-500':
        return products.filter(p => p.price > 100 && p.price <= 500);
      case '500-1000':
        return products.filter(p => p.price > 500 && p.price <= 1000);
      case '1000+':
        return products.filter(p => p.price > 1000);
      default:
        return products;
    }
  }

  // Recherche avancée avec filtres génériques
  advancedSearch<T extends SearchableItem>(
    items: T[], 
    searchTerm: string, 
    filters: { [key: string]: any } = {}
  ): T[] {
    let results = this.searchItems(searchTerm, items);
    
    // Appliquer les filtres supplémentaires
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        results = results.filter(item => 
          item[key]?.toString().toLowerCase() === filters[key]?.toString().toLowerCase()
        );
      }
    });
    
    return results;
  }

  // Nouvelle méthode : Recherche avec plusieurs catégories
  searchByMultipleCategories(categories: string[], products: any[]) {
    if (!categories.length) return products;
    return products.filter(product => categories.includes(product.category));
  }

  // Nouvelle méthode : Recherche par plage de prix
  searchByPriceRange(products: any[], minPrice?: number, maxPrice?: number) {
    return products.filter(product => {
      if (minPrice !== undefined && maxPrice !== undefined) {
        return product.price >= minPrice && product.price <= maxPrice;
      } else if (minPrice !== undefined) {
        return product.price >= minPrice;
      } else if (maxPrice !== undefined) {
        return product.price <= maxPrice;
      }
      return true;
    });
  }
}