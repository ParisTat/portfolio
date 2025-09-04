import React, { useState } from 'react';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '').trim();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ContactSection: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    if (!UUID_RE.test(ACCESS_KEY)) {
      setStatus('error');
      setErrorMsg('Invalid Web3Forms access key. Check VITE_WEB3FORMS_ACCESS_KEY.');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // combine message with site marker (avoid duplicate field)
    const msg = String(formData.get('message') || '');
    formData.delete('message');
    formData.append('message', `${msg}\n\n— Sent via my website`);

    formData.append('access_key', ACCESS_KEY);
    formData.append('subject', 'Website Contact Request');
    formData.append('from_name', 'Portfolio Website');
    formData.append('replyto', String(formData.get('email') || ''));
    formData.append('email_to', 'paris.tataridis@gmail.com');
    formData.append('botcheck', ''); // honeypot

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', body: formData });
      const data = await res.json();
      if (data?.success) {
        setStatus('success');
        form.reset();
      } else {
        setErrorMsg(data?.message || 'Something went wrong. Please try again later.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again later.');
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="container mx-auto px-6 py-24">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Get in touch</h2>
      <p className="text-slate-400 mb-8 max-w-2xl">
        Fill out the form and I’ll get back to you. Your message will be sent to
        <span className="text-slate-200 font-semibold"> paris.tataridis@gmail.com</span> and marked as
        <span className="text-slate-200 font-semibold"> sent via my website</span>.
      </p>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="from_name" value="Portfolio Website" />
          <input type="hidden" name="subject" value="Website Contact Request" />
          <input type="hidden" name="email_to" value="paris.tataridis@gmail.com" />
          <input type="hidden" name="botcheck" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="How can I help?"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-sky-500 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/40 shadow-sky-500/20 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'success' && (
              <span className="text-teal-400">Thanks! Your message has been sent.</span>
            )}
            {status === 'error' && (
              <span className="text-rose-400">{errorMsg}</span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Tip: If the form doesn’t work, you can email me directly at
            <a className="text-sky-400 hover:underline ml-1" href="mailto:paris.tataridis@gmail.com?subject=Website%20Contact%20Request&body=Sent%20via%20my%20website">
              paris.tataridis@gmail.com
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;


