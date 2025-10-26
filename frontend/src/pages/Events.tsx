import { useState } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const mockEvents = [
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
    title: "Reunião de Planejamento Q2",
    type: "reuniao" as const,
    date: "20 de Abril, 2025",
    time: "10:00 - 12:00",
    location: "Sala de Reuniões 3",
    vacancies: 0,
    totalSlots: 15,
    description: "Planejamento estratégico e definição de metas para o segundo trimestre.",
  },
  {
    id: 4,
    title: "Workshop de Design Thinking",
    type: "workshop" as const,
    date: "22 de Abril, 2025",
    time: "13:00 - 16:00",
    location: "Laboratório de Inovação",
    vacancies: 8,
    totalSlots: 20,
    description: "Metodologia prática para resolver problemas complexos através do pensamento criativo.",
  },
  {
    id: 5,
    title: "Palestra: Carreira em Tech",
    type: "palestra" as const,
    date: "25 de Abril, 2025",
    time: "18:00 - 20:00",
    location: "Auditório 2",
    vacancies: 30,
    totalSlots: 80,
    description: "Dicas e estratégias para construir uma carreira sólida na área de tecnologia.",
  },
  {
    id: 6,
    title: "Oficina de Git & GitHub",
    type: "workshop" as const,
    date: "28 de Abril, 2025",
    time: "15:00 - 18:00",
    location: "Lab de Computação 1",
    vacancies: 15,
    totalSlots: 25,
    description: "Domine o versionamento de código e colaboração em projetos usando Git e GitHub.",
  },
];

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Eventos Disponíveis</h1>
          <p className="text-muted-foreground">
            Explore oficinas, palestras e reuniões organizadas especialmente para você
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Tipo de evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="workshop">Oficinas</SelectItem>
              <SelectItem value="palestra">Palestras</SelectItem>
              <SelectItem value="reuniao">Reuniões</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <div key={event.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <EventCard {...event} />
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum evento encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
