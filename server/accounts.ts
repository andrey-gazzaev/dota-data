import { randomBytes } from 'node:crypto';
import { MongoServerError, type Collection, type Db } from 'mongodb';
import type { MongoStore } from './mongo-store';

/** A person who can sign in with an email or a login. */
type UserDoc = {
  /** Stable id stored on that person's snapshots. */
  readonly _id: string;

  /** Email or login, stored in lowercase. */
  readonly login: string;

  /** When the account was created. */
  readonly createdAt: Date;
};

/** A browser session. */
type SessionDoc = {
  /** Secret token kept in the cookie. */
  readonly _id: string;

  /** Person this session belongs to. */
  readonly userId: string;

  /** Email or login copied onto the session. */
  readonly login: string;

  /** When the session was created. */
  readonly createdAt: Date;
};

/** Signed-in person. */
export type AccountSession = {
  /** Stable id stored on that person's snapshots. */
  readonly userId: string;

  /** Email or login they typed. */
  readonly login: string;
};

/** Accounts and the sessions that point at them. */
export class Accounts {
  private readonly users: Collection<UserDoc>;

  private readonly sessions: Collection<SessionDoc>;

  public constructor(
    db: Db,
    private readonly records: MongoStore,
  ) {
    this.users = db.collection<UserDoc>('users');
    this.sessions = db.collection<SessionDoc>('sessions');
  }

  /** Unique login index. */
  public async ensureIndexes(): Promise<void> {
    await this.users.createIndex({ login: 1 }, { unique: true });
  }

  /** Opens a session, creating the account when the login is new. */
  public async enter(login: string): Promise<{ readonly token: string; readonly login: string }> {
    const existing = await this.users.findOne({ login });
    const user = existing ?? (await this.createUser(login));
    await this.claimIfFirst(user._id);
    const token = randomBytes(32).toString('hex');
    await this.sessions.insertOne({ _id: token, userId: user._id, login: user.login, createdAt: new Date() });
    return { token, login: user.login };
  }

  /** Drops one session. */
  public async leave(token: string | null): Promise<void> {
    if (!token) return;
    await this.sessions.deleteOne({ _id: token });
  }

  /** Person for this session token. Empty when the token is missing or unknown. */
  public async findSession(token: string | null): Promise<AccountSession | null> {
    if (!token) return null;
    const session = await this.sessions.findOne({ _id: token });
    if (!session) return null;
    return { userId: session.userId, login: session.login };
  }

  private async createUser(login: string): Promise<UserDoc> {
    const doc: UserDoc = { _id: randomBytes(16).toString('hex'), login, createdAt: new Date() };
    try {
      await this.users.insertOne(doc);
      return doc;
    } catch (error) {
      if (!isDuplicate(error)) throw error;
      const found = await this.users.findOne({ login });
      if (!found) throw error;
      return found;
    }
  }

  private async claimIfFirst(userId: string): Promise<void> {
    const others = await this.users.countDocuments({ _id: { $ne: userId } });
    if (others > 0) return;
    await this.records.claimUnowned(userId);
  }
}

function isDuplicate(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11000;
}
