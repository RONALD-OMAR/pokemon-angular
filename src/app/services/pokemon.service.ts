import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { NamedResource, PokemonDetail, PokemonListItem, TypeEntry, GenerationEntry, FlavorTextEntry, EvolutionChain, EvolutionStage, EvolutionDetail } from '../models/pokemon';

const BASE = 'https://pokeapi.co/api/v2';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private http = inject(HttpClient);

  private allPokemon$?: Observable<PokemonListItem[]>;
  private typeCache = new Map<string, Observable<Set<string>>>();
  private genCache = new Map<string, Observable<Set<string>>>();
  private primaryTypeCache = new Map<string, Observable<string>>();

  getTypes(): Observable<NamedResource[]> {
    return this.http
      .get<{ results: NamedResource[] }>(`${BASE}/type?limit=100`)
      .pipe(map((r) => r.results.filter((t) => !['unknown', 'shadow'].includes(t.name))));
  }

  getGenerations(): Observable<NamedResource[]> {
    return this.http.get<{ results: NamedResource[] }>(`${BASE}/generation?limit=100`).pipe(map((r) => r.results));
  }

  getAllPokemon(): Observable<PokemonListItem[]> {
    if (!this.allPokemon$) {
      this.allPokemon$ = this.http
        .get<{ results: { name: string; url: string }[] }>(`${BASE}/pokemon?limit=10000&offset=0`)
        .pipe(
          map((r) =>
            r.results.map((p) => ({
              id: this.idFromUrl(p.url),
              name: p.name,
            })),
          ),
          shareReplay(1),
        );
    }
    return this.allPokemon$;
  }

  getPokemonByType(name: string): Observable<Set<string>> {
    if (!this.typeCache.has(name)) {
      const obs = this.http
        .get<TypeEntry>(`${BASE}/type/${name}`)
        .pipe(map((r) => new Set(r.pokemon.map((p) => p.pokemon.name))), shareReplay(1));
      this.typeCache.set(name, obs);
    }
    return this.typeCache.get(name)!;
  }

  getPokemonByGeneration(nameOrId: string | number): Observable<Set<string>> {
    const key = String(nameOrId);
    if (!this.genCache.has(key)) {
      const obs = this.http
        .get<GenerationEntry>(`${BASE}/generation/${key}`)
        .pipe(map((r) => new Set(r.pokemon_species.map((p) => p.name))), shareReplay(1));
      this.genCache.set(key, obs);
    }
    return this.genCache.get(key)!;
  }

  getPokemon(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${BASE}/pokemon/${name}`);
  }

  getPrimaryType(name: string): Observable<string> {
    if (!this.primaryTypeCache.has(name)) {
      const obs = this.getPokemon(name).pipe(
        map((p) => p.types[0]?.type.name ?? 'normal'),
        shareReplay(1),
      );
      this.primaryTypeCache.set(name, obs);
    }
    return this.primaryTypeCache.get(name)!;
  }

  getPokemonDescription(name: string): Observable<string> {
    return this.http.get<{ flavor_text_entries: FlavorTextEntry[] }>(`${BASE}/pokemon-species/${name}`).pipe(
      map((r) => {
        const entry = r.flavor_text_entries.find((e) => e.language.name === 'en');
        return (entry?.flavor_text ?? '').replace(/\s+/g, ' ').trim();
      }),
    );
  }

  getEvolutionChain(name: string): Observable<EvolutionStage[]> {
    return this.http
      .get<{ evolution_chain: { url: string } }>(`${BASE}/pokemon-species/${name}`)
      .pipe(
        switchMap((species) => this.http.get<EvolutionChain>(species.evolution_chain.url)),
        map((chain) => this.flattenChain(chain.chain)),
      );
  }

  private flattenChain(link: EvolutionChain['chain']): EvolutionStage[] {
    const stages: EvolutionStage[] = [];
    const visit = (node: EvolutionChain['chain']): void => {
      const id = this.idFromSpeciesUrl(node.species.url);
      const req = this.evolutionRequirement(node.evolution_details);
      stages.push({ id, name: node.species.name, requirement: req });
      for (const next of node.evolves_to ?? []) {
        visit(next);
      }
    };
    visit(link);
    return stages;
  }

  private evolutionRequirement(details: EvolutionDetail[]): string | null {
    if (!details || details.length === 0) return null;
    const d = details[0];
    if (d.min_level) return `Nivel ${d.min_level}`;
    if (d.item?.name) return d.item.name.replace(/-/g, ' ');
    return d.trigger?.name?.replace(/-/g, ' ') ?? null;
  }

  private idFromSpeciesUrl(url: string): number {
    const match = url.match(/\/pokemon-species\/(\d+)\/?$/);
    return match ? Number(match[1]) : 0;
  }

  private idFromUrl(url: string): number {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? Number(match[1]) : 0;
  }
}
