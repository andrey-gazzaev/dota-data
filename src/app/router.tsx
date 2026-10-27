import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages';
import { Layout } from './layout';
import {
  DashboardRoute,
  DraftRoute,
  HeroRoute,
  MatchupRoute,
  PlayerRoute,
  WardRoute,
  WinrateRoute,
} from './routes/index';

/** Pages of the app and the account they belong to. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'player/:accountId', element: <PlayerRoute /> },
      { path: 'player/:accountId/dashboard', element: <DashboardRoute /> },
      { path: 'player/:accountId/heroes/:heroId', element: <HeroRoute /> },
      { path: 'player/:accountId/matchups', element: <MatchupRoute /> },
      { path: 'player/:accountId/matchups/:heroId', element: <MatchupRoute /> },
      { path: 'player/:accountId/draft', element: <DraftRoute /> },
      { path: 'player/:accountId/winrate', element: <WinrateRoute /> },
      { path: 'player/:accountId/wards', element: <WardRoute /> },
      { path: 'player/:accountId/wards/:matchId', element: <WardRoute /> },
    ],
  },
]);
