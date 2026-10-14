import { Routes } from '@angular/router';
import { PokemonListComponent } from './pages/pokemon-list/pokemon-list';
import { PokemonDetailComponent } from './pages/pokemon-detail/pokemon-detail';

export const routes: Routes = [
  { path: '', component: PokemonListComponent },
  { path: 'pokemon/:name', component: PokemonDetailComponent },
  { path: '**', redirectTo: '' },
];
