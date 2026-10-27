import { memo, useState, type FormEvent } from 'react';
import { useSignIn } from '@/queries';
import { Button, Page, Panel, TextField } from '@/ui';
import styles from './sign-in.module.css';

const signInComponent = function SignInComponent() {
  const signIn = useSignIn();
  const [login, setLogin] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = login.trim();
    if (!next) {
      setError('Введите email или логин');
      return;
    }

    setError(null);
    try {
      await signIn.mutateAsync(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось войти');
    }
  }

  return (
    <Page>
      <Panel>
        <h1 className={styles.title}>Вход</h1>
        <p className="muted">
          Email или логин. Если такого ещё нет, создадим аккаунт. Уже сохранённые игроки достанутся первому аккаунту.
        </p>

        <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
          <label>
            <span className="sr">Email или логин</span>
            <TextField
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="Email или логин"
              autoComplete="username"
              name="username"
            />
          </label>
          <Button type="submit" disabled={signIn.isPending}>
            {signIn.isPending ? 'Входим…' : 'Войти'}
          </Button>
          {error ? <p className="status">{error}</p> : null}
        </form>
      </Panel>
    </Page>
  );
};
signInComponent.displayName = 'SignIn';
/** Email or login. A new name creates the account. */
export const SignIn = memo(signInComponent);
