import { useState } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListChecks, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  type: "workshop" | "palestra" | "reuniao";
  date: string;
  time: string;
  location: string;
  vacancies: number;
  totalSlots: number;
  description: string;
}

const mockEnrolledEvents: Event[] = [
  {
    id: "1",
    title: "Introdução à Programação em Python",
    type: "workshop",
    date: "2024-02-15",
    time: "14:00",
    location: "Laboratório 1",
    vacancies: 8,
    totalSlots: 20,
    description: "Aprenda os fundamentos da programação com Python",
  },
  {
    id: "2",
    title: "Mulheres na Tecnologia",
    type: "palestra",
    date: "2024-02-20",
    time: "16:00",
    location: "Auditório Principal",
    vacancies: 45,
    totalSlots: 100,
    description: "Palestra sobre a presença feminina no mercado de tecnologia",
  },
];

const mockCompletedEvents: Event[] = [
  {
    id: "3",
    title: "HTML e CSS Básico",
    type: "workshop",
    date: "2024-01-10",
    time: "14:00",
    location: "Laboratório 2",
    vacancies: 0,
    totalSlots: 15,
    description: "Fundamentos de desenvolvimento web",
  },
];

const UserDashboard = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleCancelEnrollment = (eventId: string) => {
    toast({
      title: "Inscrição cancelada",
      description: "Sua inscrição foi cancelada com sucesso.",
    });
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Avaliação enviada!",
      description: "Obrigada pelo seu feedback.",
    });
    setRating(0);
    setComment("");
    setSelectedEventId(null);
  };

  const typeLabels = {
    workshop: "Oficina",
    lecture: "Palestra",
    meeting: "Reunião",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-meninas bg-clip-text text-transparent mb-2">
            Meu Painel
          </h1>
          <p className="text-muted-foreground">Gerencie suas inscrições e avaliações</p>
        </div>

        <Tabs defaultValue="enrolled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="enrolled">
              <ListChecks className="w-4 h-4 mr-2" />
              Inscritos
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="rate">
              <Star className="w-4 h-4 mr-2" />
              Avaliar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Eventos Inscritos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockEnrolledEvents.map((event) => (
                  <div key={event.id}>
                    <EventCard {...event} />
                    <Button
                      variant="destructive"
                      className="w-full mt-2"
                      onClick={() => handleCancelEnrollment(event.id)}
                    >
                      Cancelar Inscrição
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Eventos</CardTitle>
                <CardDescription>Seus próximos eventos organizados por data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEnrolledEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge className="mt-1">{typeLabels[event.type]}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              {new Date(event.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">{event.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>📍 {event.location}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate">
            <Card>
              <CardHeader>
                <CardTitle>Avaliar Eventos</CardTitle>
                <CardDescription>Deixe seu feedback sobre os eventos que participou</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Selecione o evento para avaliar:</Label>
                    <div className="space-y-2">
                      {mockCompletedEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedEventId === event.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('pt-BR')} - {event.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEventId && (
                    <form onSubmit={handleSubmitRating} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Avaliação</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRating(value)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  value <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-200"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comment">Comentário</Label>
                        <Textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Compartilhe sua experiência..."
                          rows={4}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={rating === 0}>
                        Enviar Avaliação
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
