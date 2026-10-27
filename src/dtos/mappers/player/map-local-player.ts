import type { LocalPlayer } from '@/models';
import type { LocalPlayerDto } from '../../schemas/player/local-player.schema';

/** An account that has a saved snapshot. */
export function mapLocalPlayer(dto: LocalPlayerDto): LocalPlayer {
  return { ...dto, sources: [...dto.sources] };
}
