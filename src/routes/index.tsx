import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import LoadingScreen from '../components/ui/LoadingScreen'
import GlobalErrorBoundary from '../components/ui/GlobalErrorBoundary'

import LandingPage from '../pages/LandingPage'

// Lazy-loaded pages — loaded on demand when the user first visits that route
const PokedexPage = lazy(() => import('../pages/PokedexPage'))
const PokemonDetailPage = lazy(() => import('../pages/PokemonDetailPage'))
const ComparePage = lazy(() => import('../pages/ComparePage'))
const TeamBuilderPage = lazy(() => import('../pages/TeamBuilderPage'))
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'))
const RegionsPage = lazy(() => import('../pages/RegionsPage'))
const TypesPage = lazy(() => import('../pages/TypesPage'))
const BattlePage = lazy(() => import('../pages/BattlePage'))
const CharactersPage = lazy(() => import('../pages/CharactersPage'))

const withSuspense = (Component: React.ComponentType, message?: string) => (
  <Suspense fallback={<LoadingScreen message={message} />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        // Eagerly imported — no Suspense needed, navigating home is always instant
        element: <LandingPage />,
      },
      {
        path: 'pokedex',
        element: withSuspense(PokedexPage, 'Syncing Pokédex Database...'),
      },
      {
        path: 'pokemon/:name',
        element: withSuspense(PokemonDetailPage, 'Fetching Pokémon Details...'),
      },
      {
        path: 'compare',
        element: withSuspense(ComparePage, 'Opening Comparison Center...'),
      },
      {
        path: 'team',
        element: withSuspense(TeamBuilderPage, 'Assembling Team Slots...'),
      },
      {
        path: 'favorites',
        element: withSuspense(FavoritesPage, 'Loading Favorites Box...'),
      },
      {
        path: 'regions',
        element: withSuspense(RegionsPage, 'Mapping Regions data...'),
      },
      {
        path: 'types',
        element: withSuspense(TypesPage, 'Loading Type Matchup Charts...'),
      },
      {
        path: 'characters',
        element: withSuspense(CharactersPage, 'Loading Characters Roster...'),
      },
      {
        path: 'battle',
        element: withSuspense(BattlePage, 'Initializing Battle Arena...'),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

export default router
