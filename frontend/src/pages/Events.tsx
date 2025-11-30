import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { eventAPI, Event } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Interface auxiliar para o TS entender os campos do Python
interface BackendEvent extends Event {
  event_type?: string;
  max_vacancies?: number;
  inscriptions_count?: number;
  availableVacancies: number;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventAPI.getAll();
        setEvents(data);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar",
          description: "Não foi possível conectar ao servidor.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    // 1. ACESSO SEGURO AO TIPO (CORREÇÃO AQUI)
    // Convertemos para acessar a propriedade 'event_type' que vem do Python
    const rawEvent = event as unknown as BackendEvent;
    const realType = rawEvent.event_type || event.type; 

    // 2. Filtro de Busca (Título/Descrição)
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 3. Filtro de Tipo (Lógica ajustada)
    let matchesType = false;

    if (filterType === "all") {
      matchesType = true;
    } else if (filterType === "reuniao") {
      // Backend manda 'reuniao_interna', filtro manda 'reuniao'
      matchesType = realType === 'reuniao_interna' || realType === 'reuniao';
    } else {
      // Outros tipos (oficina, palestra) devem bater exato
      matchesType = realType === filterType;
    }

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
              <SelectItem value="oficina">Oficinas</SelectItem>
              <SelectItem value="palestra">Palestras</SelectItem>
              <SelectItem value="reuniao">Reuniões</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              
              // Preparação de dados para o Card
              const backendEvent = event as unknown as BackendEvent;
              
              const totalVagas = backendEvent.max_vacancies || 0;
              const inscritos = backendEvent.inscriptions_count || 0;
              const vagasDisponiveis = totalVagas - inscritos;

              const rawType = backendEvent.event_type || event.type;
              let displayType: "workshop" | "palestra" | "reuniao" = "palestra";

              if (rawType === 'oficina') displayType = 'workshop';
              else if (rawType === 'palestra') displayType = 'palestra';
              else if (rawType === 'reuniao' || rawType === 'reuniao_interna') displayType = 'reuniao';

              return (
                <div key={event.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <EventCard 
                    {...event}
                    type={displayType}
                    vacancies={vagasDisponiveis}
                    totalSlots={totalVagas}
                    // Passamos também os dados crus para o Card se virar (ele já está inteligente)
                    event_type={rawType}
                    max_vacancies={totalVagas}
                    inscriptions_count={inscritos}
                  />
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {events.length === 0 
                ? "Nenhum evento encontrado no banco de dados." 
                : "Nenhum evento encontrado com os filtros selecionados."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;