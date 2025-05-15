import React, { useState } from "react";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Optionally hook into EmailJS, Formspree, etc.
    alert("Thank you for your message!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className='bg-white py-16 px-6'>
      <div className='max-w-3xl mx-auto'>
        <h2 className='text-3xl md:text-4xl font-serif text-gray-800 mb-6 text-center'>
          Get in Touch
        </h2>

        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-1 gap-6 bg-gray-50 p-8 rounded shadow'
        >
          <input
            type='text'
            name='name'
            placeholder='Your Name'
            required
            value={formData.name}
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded focus:outline-none focus:border-emerald-500'
          />

          <input
            type='email'
            name='email'
            placeholder='Your Email'
            required
            value={formData.email}
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded focus:outline-none focus:border-emerald-500'
          />

          <input
            type='text'
            name='subject'
            placeholder='Subject'
            required
            value={formData.subject}
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded focus:outline-none focus:border-emerald-500'
          />

          <textarea
            name='message'
            placeholder='Your Message'
            rows='5'
            required
            value={formData.message}
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded resize-none focus:outline-none focus:border-emerald-500'
          />

          <button
            type='submit'
            className='bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded uppercase tracking-wide text-sm'
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;
