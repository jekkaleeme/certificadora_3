import { ArrowRight, Calendar, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredEvents = [
    {
      id: 1,
      title: "Oficina de React Avançado",
      type: "workshop" as const,
      date: "15 de Abril, 2025",
      time: "14:00 - 17:00",
      location: "Sala 201 - Bloco A",
      vacancies: 12,
      totalSlots: 30,
      description: "Aprenda técnicas avançadas de React incluindo hooks customizados, otimização de performance e patterns modernos.",
    },
    {
      id: 2,
      title: "Palestra: Futuro da IA",
      type: "palestra" as const,
      date: "18 de Abril, 2025",
      time: "19:00 - 21:00",
      location: "Auditório Principal",
      vacancies: 45,
      totalSlots: 100,
      description: "Uma visão sobre as tendências e impactos da Inteligência Artificial nos próximos anos.",
    },
    {
      id: 3,
      title: "Workshop de Design Thinking",
      type: "workshop" as const,
      date: "22 de Abril, 2025",
      time: "13:00 - 16:00",
      location: "Laboratório de Inovação",
      vacancies: 8,
      totalSlots: 20,
      description: "Metodologia prática para resolver problemas complexos através do pensamento criativo.",
    },
  ];

  const features = [
    {
      icon: Calendar,
      title: "Gestão Completa",
      description: "Organize oficinas, palestras e reuniões em um só lugar",
    },
    {
      icon: Users,
      title: "Inscrições Simplificadas",
      description: "Sistema intuitivo de inscrições com controle de vagas",
    },
    {
      icon: TrendingUp,
      title: "Acompanhamento",
      description: "Métricas e relatórios detalhados de participação",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-meninas opacity-10 blur-3xl" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Empoderamento Feminino através da{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Tecnologia
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Meninas Digitais UTFPR-CP: Incentivando meninas e mulheres a explorarem o mundo da tecnologia através de oficinas, palestras e eventos transformadores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/events">
                <Button size="lg" className="gap-2 bg-gradient-primary hover:opacity-90 shadow-button text-lg px-8">
                  Ver Eventos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Começar Gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que participar do Meninas Digitais?
            </h2>
            <p className="text-muted-foreground text-lg">
              Transforme sua relação com a tecnologia e construa seu futuro
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up border border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-12 animate-fade-in">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Eventos em Destaque
              </h2>
              <p className="text-muted-foreground text-lg">
                Confira as próximas oportunidades
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <div key={event.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <EventCard {...event} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/events">
              <Button variant="outline" className="gap-2">
                Ver Todos os Eventos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto animate-scale-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Crie sua conta gratuitamente e comece a gerenciar eventos hoje mesmo
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 bg-gradient-accent hover:opacity-90 shadow-button text-lg px-8">
                Criar Conta Gratuita
                <CheckCircle className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Meninas Digitais UTFPR-CP. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
