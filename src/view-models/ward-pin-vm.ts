import type { WardMark } from '@/models';

/** A ward standing on the map at the selected time. */
export type WardPinVm = {
  /** Stable id for this pin. */
  readonly key: string;

  /** Horizontal position on the map, as a percent. */
  readonly left: number;

  /** Vertical position on the map, as a percent. */
  readonly top: number;

  /** Observer or sentry. */
  readonly kind: WardMark['kind'];

  /** True when the placing player was on Radiant. */
  readonly radiant: boolean;

  /** Text for the pin. */
  readonly label: string;
};
