import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchResults } from './search-results';

const players = [
  { accountId: 1, personaName: 'Anshef', avatarUrl: null, lastMatchTime: null },
  { accountId: 2, personaName: 'Other', avatarUrl: null, lastMatchTime: null },
];

describe('SearchResults', () => {
  it('asks the user to choose one of several players', () => {
    const onSelect = vi.fn();
    render(<SearchResults candidates={players} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Anshef/ }));
    expect(onSelect).toHaveBeenCalledWith(players[0]);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
