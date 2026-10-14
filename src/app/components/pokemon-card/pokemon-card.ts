import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { PokemonListItem } from '../../models/pokemon';
import { PokemonService } from '../../services/pokemon.service';

const TYPE_COLORS: Record<string, string> = {
  normal: '#e5e7eb',
  fire: '#fecaca',
  water: '#bfdbfe',
  electric: '#fde68a',
  grass: '#bbf7d0',
  ice: '#cffafe',
  fighting: '#fecdd3',
  poison: '#e9d5ff',
  ground: '#fde68a',
  flying: '#e0e7ff',
  psychic: '#fbcfe8',
  bug: '#d9f99d',
  rock: '#e7e5e4',
  ghost: '#ddd6fe',
  dragon: '#c7d2fe',
  dark: '#d6d3d1',
  steel: '#e5e7eb',
  fairy: '#fbcfe8',
};

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [RouterLink, TitleCasePipe],
  template: `
    <a class="card" [routerLink]="['/pokemon', item.name]" [style.background]="cardColor()">
      <span class="number">#{{ item.id.toString().padStart(3, '0') }}</span>
      <img
        [src]="imageUrl"
        [alt]="item.name"
        loading="lazy"
        (error)="onImageError($event)"
      />
      <h3>{{ item.name | titlecase }}</h3>
    </a>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        text-decoration: none;
        color: #0f172a;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.3s ease;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
      }
      .number {
        align-self: flex-start;
        font-size: 0.75rem;
        color: #475569;
        font-weight: 600;
      }
      img {
        width: 96px;
        height: 96px;
        object-fit: contain;
      }
      h3 {
        margin: 0;
        font-size: 1rem;
        text-transform: capitalize;
      }
    `,
  ],
})
export class PokemonCardComponent implements OnInit {
  @Input({ required: true }) item!: PokemonListItem;

  private service = inject(PokemonService);
  primaryType = signal('');

  cardColor = computed(() => TYPE_COLORS[this.primaryType()] ?? '#ffffff');

  ngOnInit(): void {
    this.service.getPrimaryType(this.item.name).subscribe((type) => this.primaryType.set(type));
  }

  get imageUrl(): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.item.id}.png`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
  }
}
