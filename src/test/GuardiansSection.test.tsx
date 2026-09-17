import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../i18n';
import GuardiansSection from '../components/kids/sections/GuardiansSection';
import type { GuardiansSectionHandle } from '../components/kids/sections/GuardiansSection';
import type { Guardian } from '../types/models';

function makeGuardian(overrides: Partial<Guardian> = {}): Guardian {
  return {
    first_name: 'Original',
    last_name: 'Name',
    relation_with_kid: 'father',
    authorized_for_pickup: true,
    same_address_as_kid: true,
    telephones: [],
    address: { country: 'Ελλάδα' },
    ...overrides,
  } as Guardian;
}

// Mirrors KidForm's own submit handling: flush pending guardian edits, then
// only "save" (record) the result if the flush succeeded.
function Harness({
  initialGuardians,
  onSaved,
}: {
  initialGuardians: Guardian[];
  onSaved: (guardians: Guardian[]) => void;
}) {
  const sectionRef = useRef<GuardiansSectionHandle>(null);
  const latestGuardians = useRef<Guardian[]>(initialGuardians);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await sectionRef.current?.flushActiveGuardian();
    if (ok === false) return;
    onSaved(latestGuardians.current);
  };

  return (
    <form onSubmit={handleSubmit}>
      <GuardiansSection
        ref={sectionRef}
        initialGuardians={initialGuardians}
        onChange={(g) => { latestGuardians.current = g; }}
      />
      <button type="submit">Update Kid</button>
    </form>
  );
}

describe('GuardiansSection guardian editing', () => {
  it('persists edits to both guardians when switching between them before saving', async () => {
    const user = userEvent.setup();
    const guardianA = makeGuardian({ first_name: 'Alice' });
    const guardianB = makeGuardian({ first_name: 'Bob' });
    const onSaved = vi.fn();

    render(<Harness initialGuardians={[guardianA, guardianB]} onSaved={onSaved} />);

    // Open guardian A (header shows "Alice Name") and edit its first name.
    await user.click(screen.getByText(/Alice Name/));
    const firstNameInputs = () => screen.getAllByPlaceholderText("Enter guardian's first name");
    await user.clear(firstNameInputs()[0]);
    await user.type(firstNameInputs()[0], 'AliceEdited');

    // Switch to guardian B without saving A explicitly - this collapses A.
    await user.click(screen.getByText(/Bob Name/));
    await user.clear(firstNameInputs()[1]);
    await user.type(firstNameInputs()[1], 'BobEdited');

    // Now submit the outer form, as KidForm's "Update Kid" button would.
    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const saved = onSaved.mock.calls[onSaved.mock.calls.length - 1][0] as Guardian[];
    expect(saved.map(g => g.first_name)).toEqual(['AliceEdited', 'BobEdited']);
  });

  it('persists an edit made to a guardian that is then collapsed (not switched to another)', async () => {
    const user = userEvent.setup();
    const guardianA = makeGuardian({ first_name: 'Alice' });
    const onSaved = vi.fn();

    render(<Harness initialGuardians={[guardianA]} onSaved={onSaved} />);

    await user.click(screen.getByText(/Alice Name/));
    const firstNameInput = screen.getByPlaceholderText("Enter guardian's first name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'AliceEdited');

    // Collapse by clicking the same header again (single-open accordion).
    // The header still reads the committed guardian data ("Alice Name"),
    // not the in-progress edit, until the edit is flushed.
    await user.click(screen.getByText(/Alice Name/));

    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const saved = onSaved.mock.calls[onSaved.mock.calls.length - 1][0] as Guardian[];
    expect(saved[0].first_name).toBe('AliceEdited');
  });

  it('pressing Enter in an existing guardian field submits the kid form (native bubbling)', async () => {
    const user = userEvent.setup();
    const guardianA = makeGuardian({ first_name: 'Alice' });
    const onSaved = vi.fn();

    render(<Harness initialGuardians={[guardianA]} onSaved={onSaved} />);

    await user.click(screen.getByText(/Alice Name/));
    const firstNameInput = screen.getByPlaceholderText("Enter guardian's first name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'AliceEdited{Enter}');

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const saved = onSaved.mock.calls[onSaved.mock.calls.length - 1][0] as Guardian[];
    expect(saved[0].first_name).toBe('AliceEdited');
  });

  it('finalizes an in-progress new-guardian draft on save, without requiring an explicit Add Guardian click', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(<Harness initialGuardians={[]} onSaved={onSaved} />);

    await user.click(screen.getByRole('button', { name: /Add Guardian/ }));
    const panel = screen.getByText('New Guardian').closest('.accordion-item') as HTMLElement;
    await user.type(within(panel).getByPlaceholderText("Enter guardian's first name"), 'NewGuardian');
    await user.type(within(panel).getByPlaceholderText("Enter guardian's last name"), 'Smith');
    fireEvent.change(within(panel).getByDisplayValue('Select relation'), { target: { value: 'father' } });

    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const saved = onSaved.mock.calls[onSaved.mock.calls.length - 1][0] as Guardian[];
    expect(saved).toHaveLength(1);
    expect(saved[0].first_name).toBe('NewGuardian');
  });
});
