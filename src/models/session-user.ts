/** Person signed in with an email or a login. */
export type SessionUser = {
  /** Email or login they typed, stored in lowercase. */
  readonly login: string;
};
