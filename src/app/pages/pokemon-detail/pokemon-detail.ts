import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { PokemonDetail, EvolutionStage } from '../../models/pokemon';
import { PokemonService } from '../../services/pokemon.service';
import { getTypeColor } from '../../utils/type-colors';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './pokemon-detail.html',
  styleUrls: ['./pokemon-detail.css'],
})
export class PokemonDetailComponent implements OnInit {
  pokemon = signal<PokemonDetail | null>(null);
  description = signal<string>('');
  loading = signal(true);
  Math = Math;
  error = signal<string | null>(null);
  primaryType = signal('');
  cardColor = computed(() => getTypeColor(this.primaryType()));
  cardGradient = computed(() => `linear-gradient(135deg, ${this.cardColor()} 0%, #ffffff 100%)`);
  evolutions = signal<EvolutionStage[]>([]);
  evolutionsLoading = signal(false);
  shiny = signal(false);
  currentImage = computed(() => {
    const p = this.pokemon();
    if (!p) return '';
    const artwork = p.sprites.other?.['official-artwork'];
    if (this.shiny()) {
      return artwork?.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? '';
    }
    return artwork?.front_default ?? p.sprites.front_default ?? '';
  });
  hasCry = computed(() => {
    const p = this.pokemon();
    return !!(p?.cries?.latest || p?.cries?.legacy);
  });

  private route = inject(ActivatedRoute);
  private service = inject(PokemonService);

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) {
      this.error.set('Pokémon no encontrado.');
      this.loading.set(false);
      return;
    }
    this.service.getPokemon(name).subscribe({
      next: (p) => {
        this.pokemon.set(p);
        this.primaryType.set(p.types[0]?.type.name ?? 'normal');
        this.loading.set(false);
        this.evolutionsLoading.set(true);
        this.service.getEvolutionChain(name).subscribe({
          next: (chain) => {
            this.evolutions.set(chain);
            this.evolutionsLoading.set(false);
          },
          error: () => {
            this.evolutions.set([]);
            this.evolutionsLoading.set(false);
          },
        });
        this.service.getPokemonDescription(name).subscribe({
          next: (d) => this.description.set(d),
          error: () => {},
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el Pokémon.');
        this.loading.set(false);
      },
    });
  }

  toggleShiny(): void {
    this.shiny.update((v) => !v);
  }

  playCry(): void {
    const p = this.pokemon();
    const url = p?.cries?.latest || p?.cries?.legacy;
    if (!url) return;
    const audio = new Audio(url);
    void audio.play().catch(() => {});
  }

  typeName(t: { type: { name: string } }): string {
    return t.type.name;
  }
}
