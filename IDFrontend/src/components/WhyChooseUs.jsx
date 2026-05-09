import { FaAward, FaClock, FaHeadset, FaPrint } from 'react-icons/fa';

const features = [
  {
    icon: FaPrint,
    title: 'End-to-End Printing',
    description: 'From design to delivery, we manage every step with high-quality output.',
  },
  {
    icon: FaClock,
    title: 'Quick Turnaround',
    description: 'Fast production timelines for urgent campaigns and event requirements.',
  },
  {
    icon: FaAward,
    title: 'Premium Quality',
    description: 'Sharp prints, durable materials, and finish options that elevate your brand.',
  },
  {
    icon: FaHeadset,
    title: 'Dedicated Support',
    description: 'Our team helps you choose the right product, size, and finish every time.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
          <p className="mt-3 text-gray-600">Reliable printing partner for businesses, retailers, and agencies.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <feature.icon className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
