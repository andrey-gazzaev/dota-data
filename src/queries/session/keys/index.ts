/** Cache keys for the signed-in person. */
export const sessionKeys = {
  all: ['session'] as const,
  current: ['session', 'current'] as const,
};
