import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id?: string | number;
  title: string;
  type?: string; 
  event_type?: string;
  date?: string;
  time?: string;
  start_time?: string;
  location: string;
  vacancies?: number; 
  availableVacancies?: number;
  totalSlots?: number; 
  max_vacancies?: number; 
  inscriptions_count?: number;
  description: string;
}

const eventTypeConfig: Record<string, { label: string; color: string }> = {
  workshop: { label: "Oficina", color: "bg-secondary text-secondary-foreground" },
  reuniao: { label: "Reunião", color: "bg-accent text-accent-foreground" },
  oficina: { label: "Oficina", color: "bg-secondary text-secondary-foreground" },
  palestra: { label: "Palestra", color: "bg-primary text-primary-foreground" },
  reuniao_interna: { label: "Reunião Interna", color: "bg-accent text-accent-foreground" },
};

const EventCard = (props: EventCardProps) => {
  const navigate = useNavigate();

  // --- 1. Lógica de Tipo ---
  const rawType = props.event_type || props.type || 'palestra';
  const typeConfig = eventTypeConfig[rawType] || { label: "Evento", color: "bg-gray-500 text-white" };
  const isWorkshop = rawType === 'oficina' || rawType === 'workshop';
  const isPalestra = rawType === 'palestra';

  // --- 2. Lógica de Data ---
  let displayDate = props.date;
  let displayTime = props.time;

  if (props.start_time) {
    const dateObj = new Date(props.start_time);
    displayDate = dateObj.toLocaleDateString('pt-BR');
    displayTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // --- 3. Lógica de Vagas (AJUSTADA) ---
  
  const maxV = props.max_vacancies || props.totalSlots || 0;
  const inscritos = props.inscriptions_count || 0;

  // Se maxV for 0, consideramos 0 disponíveis (Bloqueado). 
  // Se maxV > 0, fazemos a conta.
  let available = maxV > 0 ? maxV - inscritos : 0;

  // Fallback para props manuais
  if (typeof props.vacancies === 'number' && !Number.isNaN(props.vacancies)) {
      available = props.vacancies;
  }

  if (available < 0) available = 0;

  // AGORA: Se available for 0 OU maxV for 0, está cheio/indisponível.
  const isFull = available <= 0 || maxV === 0;

  // Texto do botão dinâmico
  const getButtonText = () => {
    if (maxV === 0) return "Indisponível"; // Caso específico de 0 vagas totais
    if (isFull) return "Vagas Esgotadas";  // Caso de lotado
    return "Inscrever-se";
  };

  return (
    <Card 
      className="group hover:shadow-card-hover transition-all duration-300 animate-fade-in overflow-hidden border-border cursor-pointer h-full flex flex-col"
      onClick={() => props.id && navigate(`/events/${String(props.id)}`)}
    >
      <div className={`h-2 ${isWorkshop ? 'bg-gradient-secondary' : isPalestra ? 'bg-gradient-primary' : 'bg-gradient-accent'}`} />
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {props.title}
          </h3>
          <Badge className={`${typeConfig.color} whitespace-nowrap`}>
            {typeConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{props.description}</p>
      </CardHeader>

      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{displayDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{displayTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="line-clamp-1">{props.location}</span>
        </div>
        
        {/* Só mostra o contador se tiver vagas definidas (> 0) */}
        {maxV > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span className={isFull ? "text-destructive font-medium" : "text-foreground"}>
              {isFull ? "Esgotado" : `${available} vagas disponíveis`}
            </span>
            <span className="text-muted-foreground">de {maxV}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Button 
          className={`w-full shadow-button ${isFull ? 'bg-muted text-muted-foreground cursor-not-allowed hover:opacity-100' : 'bg-gradient-primary hover:opacity-90'}`}
          disabled={isFull}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;