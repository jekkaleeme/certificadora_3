import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id?: string | number;
  title: string;
  type: "workshop" | "palestra" | "reuniao";
  date: string;
  time: string;
  location: string;
  vacancies: number;
  totalSlots: number;
  description: string;
}

const eventTypeConfig = {
  workshop: {
    label: "Oficina",
    color: "bg-secondary text-secondary-foreground",
  },
  palestra: {
    label: "Palestra",
    color: "bg-primary text-primary-foreground",
  },
  reuniao: {
    label: "Reunião",
    color: "bg-accent text-accent-foreground",
  },
};

const EventCard = ({
  id,
  title,
  type,
  date,
  time,
  location,
  vacancies,
  totalSlots,
  description,
}: EventCardProps) => {
  const navigate = useNavigate();
  const typeConfig = eventTypeConfig[type];
  const isFull = vacancies === 0;

  return (
    <Card 
      className="group hover:shadow-card-hover transition-all duration-300 animate-fade-in overflow-hidden border-border cursor-pointer"
      onClick={() => id && navigate(`/events/${String(id)}`)}
    >
      <div className={`h-2 ${type === 'workshop' ? 'bg-gradient-secondary' : type === 'palestra' ? 'bg-gradient-primary' : 'bg-gradient-accent'}`} />
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge className={typeConfig.color}>
            {typeConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className={vacancies === 0 ? "text-destructive font-medium" : "text-foreground"}>
            {vacancies > 0 ? `${vacancies} vagas disponíveis` : "Esgotado"}
          </span>
          <span className="text-muted-foreground">de {totalSlots}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90 shadow-button"
          disabled={isFull}
        >
          {isFull ? "Vagas Esgotadas" : "Inscrever-se"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
