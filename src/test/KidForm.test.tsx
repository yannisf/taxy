import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import '../i18n';
import { KidForm } from '../components/kids/KidForm';
import { KidsContext } from '../hooks/useKids';
import { ClassContext } from '../hooks/useClass';
import type { Kid } from '../types/models';

const updateKid = vi.fn().mockResolvedValue(undefined);
const getClassById = vi.fn();
const addKid = vi.fn();

vi.mock('../services/database', () => ({
  db: {
    updateKid: (...args: unknown[]) => updateKid(...args),
    getClassById: (...args: unknown[]) => getClassById(...args),
    addKid: (...args: unknown[]) => addKid(...args),
  },
}));

function makeKid(): Kid {
  return {
    kid_id: 'kid-1',
    class_id: 'class-1',
    first_name: 'Kiddo',
    last_name: 'Test',
    gender: 'male',
    level: 'kindergartner',
    extended_day_care: false,
    special_education: false,
    guardians: [
      {
        first_name: 'Alice',
        last_name: 'Guardian',
        relation_with_kid: 'mother',
        authorized_for_pickup: true,
        same_address_as_kid: true,
        telephones: [],
        address: { country: 'Ελλάδα' },
      },
      {
        first_name: 'Bob',
        last_name: 'Guardian',
        relation_with_kid: 'father',
        authorized_for_pickup: true,
        same_address_as_kid: true,
        telephones: [],
        address: { country: 'Ελλάδα' },
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const kidsContextValue = { kids: [], refreshKids: vi.fn().mockResolvedValue(undefined), loading: false };
const classContextValue = {
  classes: [],
  selectedClass: null,
  loading: false,
  refreshClasses: vi.fn().mockResolvedValue(undefined),
  selectClass: vi.fn().mockResolvedValue(undefined),
  clearSelectedClass: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn().mockResolvedValue(undefined),
  deleteClass: vi.fn().mockResolvedValue(undefined),
};

function renderKidForm(kid: Kid, onSubmitSuccess: (id?: string) => void) {
  const routes = [
    {
      path: '/kids/:kidId/edit',
      element: (
        <KidsContext.Provider value={kidsContextValue}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ClassContext.Provider value={classContextValue as any}>
            <KidForm initialData={kid} onSubmitSuccess={onSubmitSuccess} />
          </ClassContext.Provider>
        </KidsContext.Provider>
      ),
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [`/kids/${kid.kid_id}/edit`] });
  return render(<RouterProvider router={router} />);
}

describe('KidForm guardian editing (full integration)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateKid.mockClear();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const renderLoop = consoleErrorSpy.mock.calls.some((call: unknown[]) =>
      String(call[0]).includes('Maximum update depth exceeded')
    );
    consoleErrorSpy.mockRestore();
    expect(renderLoop).toBe(false);
  });

  it('saves the kid with both guardians edits after switching between them, without hanging', async () => {
    const user = userEvent.setup();
    const kid = makeKid();
    const onSubmitSuccess = vi.fn();

    renderKidForm(kid, onSubmitSuccess);

    await user.click(screen.getByText(/Alice Guardian/));
    const firstNameInputs = () => screen.getAllByPlaceholderText("Enter guardian's first name");
    await user.clear(firstNameInputs()[0]);
    await user.type(firstNameInputs()[0], 'AliceEdited');

    await user.click(screen.getByText(/Bob Guardian/));
    await user.clear(firstNameInputs()[1]);
    await user.type(firstNameInputs()[1], 'BobEdited');

    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => expect(updateKid).toHaveBeenCalled(), { timeout: 3000 });
    await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalled(), { timeout: 3000 });

    const [, updates] = updateKid.mock.calls[0] as [string, Kid];
    expect(updates.guardians.map(g => g.first_name)).toEqual(['AliceEdited', 'BobEdited']);
  });

  it('adds a new guardian alongside existing ones and saves all three', async () => {
    const user = userEvent.setup();
    const kid = makeKid();
    const onSubmitSuccess = vi.fn();

    renderKidForm(kid, onSubmitSuccess);

    await user.click(screen.getByRole('button', { name: /Add Guardian/ }));

    const firstNameInputs = screen.getAllByPlaceholderText("Enter guardian's first name");
    const lastNameInputs = screen.getAllByPlaceholderText("Enter guardian's last name");
    const relationSelects = screen.getAllByDisplayValue('Select relation');
    expect(firstNameInputs).toHaveLength(3);
    await user.type(firstNameInputs[2], 'Carol');
    await user.type(lastNameInputs[2], 'Guardian');
    await user.selectOptions(relationSelects[relationSelects.length - 1], 'mother');

    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => expect(updateKid).toHaveBeenCalled(), { timeout: 3000 });
    const [, updates] = updateKid.mock.calls[0] as [string, Kid];
    expect(updates.guardians).toHaveLength(3);
    expect(updates.guardians[2].first_name).toBe('Carol');
  });

  it('deletes a guardian and saves only the remaining one', async () => {
    const user = userEvent.setup();
    const kid = makeKid();
    const onSubmitSuccess = vi.fn();

    renderKidForm(kid, onSubmitSuccess);

    // The delete button lives in the accordion header, visible regardless
    // of whether that guardian's panel is expanded.
    await user.click(screen.getAllByTitle('Delete guardian')[0]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => expect(updateKid).toHaveBeenCalled(), { timeout: 3000 });
    const [, updates] = updateKid.mock.calls[0] as [string, Kid];
    expect(updates.guardians).toHaveLength(1);
    expect(updates.guardians[0].first_name).toBe('Bob');
  });

  it('plain Enter in a text field does not save the kid', async () => {
    const user = userEvent.setup();
    renderKidForm(makeKid(), vi.fn());

    await user.click(screen.getByText(/Alice Guardian/));
    const firstNameInput = screen.getAllByPlaceholderText("Enter guardian's first name")[0];
    await user.type(firstNameInput, 'X{Enter}');

    // Give a would-be async submit a chance to reach the database.
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(updateKid).not.toHaveBeenCalled();
  });

  it('Ctrl+Enter in a text field saves the kid with pending edits', async () => {
    const user = userEvent.setup();
    renderKidForm(makeKid(), vi.fn());

    await user.click(screen.getByText(/Alice Guardian/));
    const firstNameInput = screen.getAllByPlaceholderText("Enter guardian's first name")[0];
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'AliceEdited{Control>}{Enter}{/Control}');

    await waitFor(() => expect(updateKid).toHaveBeenCalled(), { timeout: 3000 });
    const [, updates] = updateKid.mock.calls[0] as [string, Kid];
    expect(updates.guardians[0].first_name).toBe('AliceEdited');
  });

  it.each([
    ['a dropdown', () => screen.getAllByDisplayValue('Mother')[0]],
    ['a checkbox', () => screen.getAllByRole('checkbox')[0]],
    ['a textarea', () => screen.getByPlaceholderText('General notes about the child')],
    ['a button', () => screen.getByRole('button', { name: /Bob Guardian/ })],
  ])('Ctrl+Enter saves the kid when focus is on %s', async (_label, getElement) => {
    const user = userEvent.setup();
    renderKidForm(makeKid(), vi.fn());

    await user.click(screen.getByText(/Alice Guardian/));
    getElement().focus();
    await user.keyboard('{Control>}{Enter}{/Control}');

    await waitFor(() => expect(updateKid).toHaveBeenCalled(), { timeout: 3000 });
  });

  it('blocks saving when a guardian is left with a missing required field', async () => {
    const user = userEvent.setup();
    const kid = makeKid();
    const onSubmitSuccess = vi.fn();

    renderKidForm(kid, onSubmitSuccess);

    await user.click(screen.getByText(/Alice Guardian/));
    const firstNameInput = screen.getAllByPlaceholderText("Enter guardian's first name")[0];
    await user.clear(firstNameInput);

    await user.click(screen.getByRole('button', { name: 'Update Kid' }));

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(updateKid).not.toHaveBeenCalled();
    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });
});
