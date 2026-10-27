import { memo } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useSessionContext } from '@/context';
import { AccountBadge, RefreshPlayer, SearchPlayer, SignIn } from '@/feature';
import { Shell, Topbar } from '@/ui';

const layoutComponent = function LayoutComponent() {
  const session = useSessionContext();
  const accountId = Number(useParams().accountId);

  if (session.isLoading) {
    return (
      <Shell>
        <p className="status">Загрузка…</p>
      </Shell>
    );
  }

  if (session.error) {
    return (
      <Shell>
        <p className="status">{session.error}</p>
      </Shell>
    );
  }

  if (!session.user) {
    return (
      <Shell>
        <SignIn />
      </Shell>
    );
  }

  const knownPlayer = Number.isSafeInteger(accountId) && accountId > 0;

  return (
    <Shell>
      <Topbar brand={<Link to="/">Разбор</Link>}>
        <SearchPlayer />
        {knownPlayer ? <RefreshPlayer accountId={accountId} /> : null}
        <AccountBadge />
      </Topbar>
      <Outlet />
    </Shell>
  );
};
layoutComponent.displayName = 'Layout';
/** App frame: search, refresh, and the current page. */
export const Layout = memo(layoutComponent);
