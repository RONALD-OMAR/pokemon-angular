import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NamedResource } from '../../models/pokemon';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [FormsModule, PokemonCardComponent, TitleCasePipe],
  templateUrl: './pokemon-list.html',
  styleUrls: ['./pokemon-list.css'],
})
export class PokemonListComponent implements OnInit {
  readonly pageSize = 20;

  types = signal<NamedResource[]>([]);
  generations = signal<NamedResource[]>([]);
  all = signal<{ id: number; name: string }[]>([]);

  search = signal('');
  selectedType = signal('');
  selectedGeneration = signal('');

  typeSet = signal<Set<string> | null>(null);
  genSet = signal<Set<string> | null>(null);

  page = signal(1);
  loading = signal(true);
  error = signal<string | null>(null);

  filtered = computed(() => {
    let list = this.all();
    const ts = this.typeSet();
    if (ts) list = list.filter((p) => ts.has(p.name));
    const gs = this.genSet();
    if (gs) list = list.filter((p) => gs.has(p.name));
    const q = this.search().trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.includes(q));
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor(private service: PokemonService) {}

  ngOnInit(): void {
    this.service.getTypes().subscribe({
      next: (t) => this.types.set(t),
      error: () => {},
    });
    this.service.getGenerations().subscribe({
      next: (g) => this.generations.set(g),
      error: () => {},
    });
    this.service.getAllPokemon().subscribe({
      next: (list) => {
        this.all.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los Pokémon.');
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value);
    this.page.set(1);
    if (!value) {
      this.typeSet.set(null);
      return;
    }
    this.service.getPokemonByType(value).subscribe((s) => this.typeSet.set(s));
  }

  onGenerationChange(value: string): void {
    this.selectedGeneration.set(value);
    this.page.set(1);
    if (!value) {
      this.genSet.set(null);
      return;
    }
    this.service.getPokemonByGeneration(value).subscribe((s) => this.genSet.set(s));
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedType.set('');
    this.selectedGeneration.set('');
    this.typeSet.set(null);
    this.genSet.set(null);
    this.page.set(1);
  }

  prevPage(): void {
    this.page.set(Math.max(1, this.page() - 1));
  }

  nextPage(): void {
    this.page.set(Math.min(this.totalPages(), this.page() + 1));
  }
}
