import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react"; // Adicionei o Loader2
import { eventAPI, Event } from "@/services/api"; // Importando nossa API
import { toast } from "@/hooks/use-toast";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]); // Lista vazia inicial
  const [isLoading, setIsLoading] = useState(true); // Começa carregando
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Busca os dados do Python ao abrir a página
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
          description: "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Nota: O backend retorna 'oficina', o filtro original usava 'workshop'. 
    // Ajuste conforme a necessidade do seu filtro visual.
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
              {/* Ajuste: Mudei para 'oficina' para bater com o retorno da API */}
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
            {filteredEvents.map((event, index) => (
              <div key={event.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <EventCard 
                  {...event}
                  // TRADUÇÃO DE CAMPOS:
                  // Usamos um cast específico aqui para evitar o 'any'.
                  // Dizemos ao TS: "Se não for oficina (que vira workshop), com certeza é palestra ou reuniao".
                  type={event.type === 'oficina' ? 'workshop' : (event.type as "palestra" | "reuniao")} 
                  vacancies={event.availableVacancies}
                  totalSlots={event.maxVacancies}
                />
              </div>
            ))}
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