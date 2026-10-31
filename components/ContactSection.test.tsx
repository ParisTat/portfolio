import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const VALID_ACCESS_KEY = '00000000-0000-4000-8000-000000000000';

async function loadContactSection(accessKey = VALID_ACCESS_KEY): Promise<ComponentType> {
  vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', accessKey);
  vi.resetModules();
  const mod = await import('./ContactSection');
  return mod.default;
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Jane Doe');
  await user.type(screen.getByLabelText('Email'), 'jane@example.com');
  await user.type(screen.getByLabelText('Message'), 'Hello, this is a long enough message.');
}

describe('ContactSection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders name, email and message fields linked to their labels', async () => {
    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('shows validation errors and does not call fetch when required fields are empty', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/message must be at least/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email address', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn());

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await user.type(screen.getByLabelText('Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Message'), 'Hello, this is a long enough message.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  describe('focus management after a failed submit', () => {
    it('moves focus to the name field when every field is invalid', async () => {
      const user = userEvent.setup();
      vi.stubGlobal('fetch', vi.fn());

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toHaveFocus();
      expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Please enter your name.');
    });

    it('announces field errors through the focused field instead of assertive alerts', async () => {
      const user = userEvent.setup();
      vi.stubGlobal('fetch', vi.fn());

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      // All three fields are invalid, yet none of the inline messages is a
      // role="alert" region: that would stack up to three assertive
      // announcements on top of the focused field's own description.
      expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
      expect(screen.getByText(/message must be at least/i)).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps focus on the first invalid field when a failed submit is repeated', async () => {
      const user = userEvent.setup();
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      const sendButton = screen.getByRole('button', { name: /send message/i });
      await user.click(sendButton);
      expect(screen.getByLabelText('Name')).toHaveFocus();

      await user.click(sendButton);
      expect(screen.getByLabelText('Name')).toHaveFocus();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('moves focus on to the next invalid field as each one is fixed and the form is resubmitted', async () => {
      const user = userEvent.setup();
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      const sendButton = screen.getByRole('button', { name: /send message/i });
      await user.click(sendButton);
      expect(screen.getByLabelText('Name')).toHaveFocus();

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.click(sendButton);
      expect(screen.getByLabelText('Email')).toHaveFocus();
      expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid');

      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.click(sendButton);
      expect(screen.getByLabelText('Message')).toHaveFocus();
      expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['malformed', 'not-a-uuid'],
      ['missing', ''],
    ])('leaves focus on the Send button when the fields are valid but the access key is %s', async (_label, accessKey) => {
      const user = userEvent.setup();
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const ContactSection = await loadContactSection(accessKey);
      render(<ContactSection />);

      await fillValidForm(user);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      await user.click(sendButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
      expect(sendButton).toHaveFocus();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('moves focus to the email field when only the name is valid and the email is malformed', async () => {
      const user = userEvent.setup();
      vi.stubGlobal('fetch', vi.fn());

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText('Email'), 'not-an-email');
      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toHaveFocus();
      expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Please enter a valid email address.');
    });

    it('moves focus to the message field when only the message is too short', async () => {
      const user = userEvent.setup();
      vi.stubGlobal('fetch', vi.fn());

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Message'), 'short');
      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(await screen.findByText(/message must be at least/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Message')).toHaveFocus();
      expect(screen.getByLabelText('Message')).toHaveAccessibleDescription('Message must be at least 10 characters.');
    });

    it('marks the field invalid and links its error before it receives focus', async () => {
      const user = userEvent.setup();
      vi.stubGlobal('fetch', vi.fn());

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      // Screen readers read aria-invalid / aria-describedby at the moment of
      // focus, so the error wiring must already be in the DOM by then.
      const emailInput = screen.getByLabelText('Email');
      const seenOnFocus: Array<{ invalid: string | null; describedBy: string | null; errorText: string | null }> = [];
      emailInput.addEventListener('focus', () => {
        const describedBy = emailInput.getAttribute('aria-describedby');
        seenOnFocus.push({
          invalid: emailInput.getAttribute('aria-invalid'),
          describedBy,
          errorText: describedBy ? (document.getElementById(describedBy)?.textContent ?? null) : null,
        });
      });

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(emailInput, 'not-an-email');
      seenOnFocus.length = 0; // ignore the focus caused by typing itself
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await screen.findByText(/please enter a valid email address/i);
      expect(seenOnFocus).toEqual([
        { invalid: 'true', describedBy: expect.any(String), errorText: 'Please enter a valid email address.' },
      ]);
    });

    it('does not move focus away from the button when the submit passes validation', async () => {
      const user = userEvent.setup();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) })
      );

      const ContactSection = await loadContactSection();
      render(<ContactSection />);

      await fillValidForm(user);
      const button = screen.getByRole('button', { name: /send message/i });
      await user.click(button);

      expect(await screen.findByText(/thanks! your message has been sent/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).not.toHaveFocus();
      expect(screen.getByLabelText('Email')).not.toHaveFocus();
      expect(screen.getByLabelText('Message')).not.toHaveFocus();
    });
  });

  it('submits successfully and resets the form', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/thanks! your message has been sent/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Message')).toHaveValue('');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Only one botcheck value should ever be sent.
    const body = fetchSpy.mock.calls[0][1].body as FormData;
    expect(body.getAll('botcheck')).toHaveLength(1);
    expect(body.has('email_to')).toBe(false);
  });

  it('shows a generic message when the API responds with success: false', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, message: 'Invalid Web3Forms access key. Check your dashboard.' }),
      })
    );

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);
    expect(alert).not.toHaveTextContent(/access key/i);
  });

  it('shows a generic message on a non-OK HTTP response', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('not json');
        },
      })
    );

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);
  });

  it('handles a malformed (non-JSON) response body without throwing', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      })
    );

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);
  });

  it('shows a network error message when fetch rejects', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));

    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/network error/i);
  });

  it('shows a generic message and never calls fetch when the access key is misconfigured', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const ContactSection = await loadContactSection('not-a-uuid');
    render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong/i);
    expect(alert).not.toHaveTextContent(/access key/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('never renders the plain email address as page text', async () => {
    const ContactSection = await loadContactSection();
    const { container } = render(<ContactSection />);

    expect(container.textContent).not.toMatch(/paris\.tataridis@gmail\.com/i);
  });

  it('navigates to the mailto fallback on click, and keeps the honeypot out of the tab order', async () => {
    const ContactSection = await loadContactSection();
    const { container } = render(<ContactSection />);

    // jsdom has no real navigation implementation; a real assignment to
    // window.location.href logs a noisy "Not implemented: navigation"
    // error. jsdom's Location.href accessor itself isn't reconfigurable,
    // so swap out the whole window.location object for a plain stub the
    // assertion below can read back safely.
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, href: '' },
    });

    const mailButton = screen.getByRole('button', { name: /email me directly/i });
    expect(window.location.href).toBe('');

    const user = userEvent.setup();
    await user.click(mailButton);

    expect(window.location.href).toMatch(/^mailto:.+@.+/);

    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: originalLocation });

    expect(screen.queryByRole('textbox', { name: /leave this field empty/i })).not.toBeInTheDocument();
    const honeypot = container.querySelector('input[name="botcheck"]');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
  });

  it('activates the mailto fallback via the keyboard (Enter)', async () => {
    const ContactSection = await loadContactSection();
    render(<ContactSection />);

    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, href: '' },
    });

    const mailButton = screen.getByRole('button', { name: /email me directly/i });
    mailButton.focus();
    expect(document.activeElement).toBe(mailButton);

    const user = userEvent.setup();
    await user.keyboard('{Enter}');
    expect(window.location.href).toMatch(/^mailto:.+@.+/);

    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: originalLocation });
  });

  it('sets aria-busy on the form while submitting', async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: unknown) => void = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    const ContactSection = await loadContactSection();
    const { container } = render(<ContactSection />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('aria-busy', 'true');

    resolveFetch({ ok: true, json: async () => ({ success: true }) });
    await screen.findByText(/thanks! your message has been sent/i);
    expect(form).toHaveAttribute('aria-busy', 'false');
  });
});
