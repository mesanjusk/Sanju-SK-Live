import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import FormStatus from './common/FormStatus';

export default function Contact() {
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus({ type: 'success', message: 'Thanks! We received your message.' });
    event.target.reset();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
        <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">Contact Us</h1>
          <p className="mb-4">If you have any questions, feel free to reach out to us!</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormStatus type={status.type} message={status.message} />
            <div>
              <label className="mb-1 block font-medium">Name</label>
              <input
                required
                type="text"
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Email</label>
              <input
                required
                type="email"
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium">Message</label>
              <textarea
                required
                rows="4"
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Your message"
              />
            </div>
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
