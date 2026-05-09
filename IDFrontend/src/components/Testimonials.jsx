import { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

const mockTestimonials = [
  {
    name: 'Rohit Mehta',
    company: 'Retail Hub',
    feedback: 'The print quality and color accuracy were outstanding. Our store branding looks premium now.',
    rating: 5,
  },
  {
    name: 'Anjali Soni',
    company: 'Event Planner',
    feedback: 'They delivered banners and standees right on time. Smooth coordination and excellent finish.',
    rating: 5,
  },
  {
    name: 'Farhan Khan',
    company: 'Startup Founder',
    feedback: 'Business cards and packaging inserts came out exactly as our brand guidelines.',
    rating: 4,
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = useMemo(() => mockTestimonials[activeIndex], [activeIndex]);

  const next = () => setActiveIndex((prev) => (prev + 1) % mockTestimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">What Clients Say</h2>
          <p className="mt-3 text-gray-600">Trusted by businesses for impactful advertising materials.</p>
        </div>

        <div className="mt-10 rounded-xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center justify-center gap-1 text-yellow-400">
            {Array.from({ length: 5 }).map((_, idx) => (
              <FaStar key={idx} className={idx < active.rating ? 'opacity-100' : 'opacity-30'} />
            ))}
          </div>
          <p className="text-center text-gray-700">“{active.feedback}”</p>
          <div className="mt-6 text-center">
            <h3 className="font-bold text-gray-800">{active.name}</h3>
            <p className="text-sm text-gray-600">{active.company}</p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="rounded-full border border-gray-200 p-2 text-gray-600 transition-all duration-300 hover:border-red-600 hover:text-red-600"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={next}
              className="rounded-full border border-gray-200 p-2 text-gray-600 transition-all duration-300 hover:border-red-600 hover:text-red-600"
              aria-label="Next testimonial"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
