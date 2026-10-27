import { memo } from 'react';
import { useSessionContext } from '@/context';
import { useSignOut } from '@/queries';
import { Button } from '@/ui';
import styles from './account-badge.module.css';

const accountBadgeComponent = function AccountBadgeComponent() {
  const session = useSessionContext();
  const signOut = useSignOut();
  const login = session.user?.login;
  if (!login) return null;

  return (
    <div className={styles.badge}>
      <span className={styles.login} title={login}>
        {login}
      </span>
      <Button variant="ghost" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
        {signOut.isPending ? 'Выходим…' : 'Выйти'}
      </Button>
    </div>
  );
};
accountBadgeComponent.displayName = 'AccountBadge';
/** Current login and the sign-out action. */
export const AccountBadge = memo(accountBadgeComponent);
