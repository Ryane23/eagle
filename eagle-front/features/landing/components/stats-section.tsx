const stats = [
  { value: "1,200+", label: "Consultations réalisées" },
  { value: "4", label: "Centres connectés" },
  { value: "15+", label: "Médecins spécialistes" },
  { value: "98%", label: "Satisfaction patients" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-secondary to-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stat.value}
              </p>
              <p className="text-sm sm:text-base text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

