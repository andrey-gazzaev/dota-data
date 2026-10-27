/** How far a refresh or parse has got. */
export type Progress = {
  /** Source this step belongs to. */
  readonly source: string;

  /** Step name. */
  readonly phase: string;

  /** Text shown while this step runs. */
  readonly message: string;
};

/** Outcome of refreshing one source. */
export type RefreshResult = {
  /** Source that was refreshed. */
  readonly source: 'opendota' | 'steam' | 'stratz';

  /** Whether the source was saved, skipped, or failed. */
  readonly status: 'updated' | 'skipped' | 'error';

  /** What happened, ready to show. */
  readonly message: string;
};
