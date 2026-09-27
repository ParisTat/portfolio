import React, { useId, useState } from 'react';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '').trim();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MAX_LENGTH = 100;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 5000;

const GENERIC_SUBMIT_ERROR =
  'Something went wrong sending your message. Please try again, or email me directly using the link below.';

// Kept as two parts rather than one literal so the address never appears as a
// single plain-text token in the page source for scrapers to harvest.
const CONTACT_EMAIL_USER = 'paris.tataridis';
const CONTACT_EMAIL_DOMAIN = 'gmail.com';

const buildMailtoHref = (): string => {
  const email = `${CONTACT_EMAIL_USER}@${CONTACT_EMAIL_DOMAIN}`;
  const subject = encodeURIComponent('Website Contact Request');
  const body = encodeURIComponent('Sent via my website');
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
  botcheck: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface Web3FormsResponse {
  success?: boolean;
  message?: string;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialValues: ContactFormValues = { name: '', email: '', message: '', botcheck: '' };

function validateValues(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (name.length < 1) {
    errors.name = 'Please enter your name.';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (message.length < MESSAGE_MIN_LENGTH) {
    errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters.`;
  } else if (message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
}

async function parseJsonResponse(res: Response): Promise<Web3FormsResponse | null> {
  try {
    const json: unknown = await res.json();
    if (json && typeof json === 'object') {
      return json as Web3FormsResponse;
    }
    return null;
  } catch {
    return null;
  }
}

const ContactSection: React.FC = () => {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const messageErrorId = useId();
  const honeypotId = useId();

  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isSubmitting = status === 'submitting';

  const handleFieldChange =
    (field: keyof ContactFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      setValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleMailtoInteraction = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = buildMailtoHref();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateValues(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    if (!UUID_RE.test(ACCESS_KEY)) {
      setStatus('error');
      setErrorMsg(GENERIC_SUBMIT_ERROR);
      return;
    }

    const formData = new FormData();
    formData.append('name', values.name.trim());
    formData.append('email', values.email.trim());
    formData.append('message', `${values.message.trim()}\n\n— Sent via my website`);
    formData.append('access_key', ACCESS_KEY);
    formData.append('subject', 'Website Contact Request');
    formData.append('from_name', 'Portfolio Website');
    formData.append('replyto', values.email.trim());
    formData.append('botcheck', values.botcheck);

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', body: formData });
      const data = await parseJsonResponse(res);

      if (res.ok && data?.success) {
        setStatus('success');
        setValues(initialValues);
        setFieldErrors({});
      } else {
        setStatus('error');
        setErrorMsg(GENERIC_SUBMIT_ERROR);
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <section id="contact" className="container mx-auto px-6 py-24">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Get in touch</h2>
      <p className="text-slate-400 mb-8 max-w-2xl">
        Fill out the form and I’ll get back to you. Your message will be marked as
        <span className="text-slate-200 font-semibold"> sent via my website</span>.
      </p>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg">
        <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} className="space-y-6">
          {/* Honeypot: hidden from sighted users and assistive tech; real visitors never see or fill this in */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor={honeypotId}>Leave this field empty</label>
            <input
              type="text"
              id={honeypotId}
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              value={values.botcheck}
              onChange={handleFieldChange('botcheck')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor={nameId} className="block text-sm text-slate-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id={nameId}
                name="name"
                autoComplete="name"
                required
                maxLength={NAME_MAX_LENGTH}
                value={values.name}
                onChange={handleFieldChange('name')}
                aria-invalid={fieldErrors.name ? true : undefined}
                aria-describedby={fieldErrors.name ? nameErrorId : undefined}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                placeholder="Your name"
              />
              {fieldErrors.name && (
                <p id={nameErrorId} role="alert" className="text-rose-400 text-sm mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={emailId} className="block text-sm text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id={emailId}
                name="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={handleFieldChange('email')}
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? emailErrorId : undefined}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p id={emailErrorId} role="alert" className="text-rose-400 text-sm mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor={messageId} className="block text-sm text-slate-300 mb-2">
              Message
            </label>
            <textarea
              id={messageId}
              name="message"
              autoComplete="off"
              required
              rows={5}
              minLength={MESSAGE_MIN_LENGTH}
              maxLength={MESSAGE_MAX_LENGTH}
              value={values.message}
              onChange={handleFieldChange('message')}
              aria-invalid={fieldErrors.message ? true : undefined}
              aria-describedby={fieldErrors.message ? messageErrorId : undefined}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              placeholder="How can I help?"
            />
            {fieldErrors.message && (
              <p id={messageErrorId} role="alert" className="text-rose-400 text-sm mt-1">
                {fieldErrors.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-500 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/40 shadow-sky-500/20 disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          <p role="status" aria-live="polite" className="text-teal-400 text-sm">
            {isSubmitting && 'Sending your message…'}
            {status === 'success' && 'Thanks! Your message has been sent.'}
          </p>
          {status === 'error' && (
            <p role="alert" className="text-rose-400 text-sm">
              {errorMsg}
            </p>
          )}

          <p className="text-xs text-slate-500">
            Tip: If the form doesn’t work, you can{' '}
            <a
              className="text-sky-400 hover:underline"
              href="#"
              onClick={handleMailtoInteraction}
              onFocus={handleMailtoInteraction}
            >
              email me directly
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
