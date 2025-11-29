import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListChecks, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { userAPI, enrollmentAPI, eventAPI, ratingAPI, Event, User } from "@/services/api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]); // Eventos passados para avaliar
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({}); // Mapa eventId -> enrollmentId para cancelamento
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Avaliação
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Labels para tradução
  const typeLabels: Record<string, string> = {
    oficina: "Oficina",
    palestra: "Palestra",
    reuniao: "Reunião",
    workshop: "Oficina", 
    lecture: "Palestra",
    meeting: "Reunião"
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. Verifica autenticação
        const currentUser = await userAPI.getCurrent();
        setUser(currentUser);

        // 2. Busca inscrições
        const enrollments = await enrollmentAPI.getByUser(currentUser.id);
        
        // 3. Busca detalhes de cada evento inscrito
        // (Fazemos isso porque a API de enrollment retorna apenas IDs)
        const activeEnrollments = enrollments.filter(e => e.status !== 'cancelled');
        
        const eventsPromises = activeEnrollments.map(async (enrollment) => {
          try {
            const eventData = await eventAPI.getById(enrollment.eventId);
            return { event: eventData, enrollmentId: enrollment.id };
          } catch (err) {
            console.error(`Erro ao carregar evento ${enrollment.eventId}`, err);
            return null;
          }
        });

        const results = await Promise.all(eventsPromises);
        
        // Filtra nulos e organiza
        const validResults = results.filter(r => r !== null) as { event: Event, enrollmentId: string }[];
        
        const newEnrollmentMap: Record<string, string> = {};
        const upcoming: Event[] = [];
        const past: Event[] = [];
        const now = new Date();

        validResults.forEach(({ event, enrollmentId }) => {
          newEnrollmentMap[event.id] = enrollmentId;
          
          // Separa por data
          const eventDate = new Date(`${event.date}T${event.time}`);
          // Fallback simples se a data não tiver hora válida
          const comparisonDate = isNaN(eventDate.getTime()) ? new Date(event.date) : eventDate;

          if (comparisonDate < now) {
            past.push(event);
          } else {
            upcoming.push(event);
          }
        });

        setEnrollmentMap(newEnrollmentMap);
        setEnrolledEvents(upcoming);
        setPastEvents(past);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente."
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleCancelEnrollment = async (eventId: string) => {
    const enrollmentId = enrollmentMap[eventId];
    if (!enrollmentId) return;

    if (!confirm("Tem certeza que deseja cancelar sua inscrição?")) return;

    try {
      await enrollmentAPI.cancel(enrollmentId);
      
      toast({
        title: "Inscrição cancelada",
        description: "Sua inscrição foi cancelada com sucesso.",
      });

      // Remove da lista visualmente
      setEnrolledEvents(prev => prev.filter(e => e.id !== eventId));
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível cancelar a inscrição."
      });
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !user) return;
    
    setIsSubmitting(true);
    try {
      await ratingAPI.create({
        userId: user.id,
        eventId: selectedEventId,
        rating: rating,
        comment: comment
      });

      toast({
        title: "Avaliação enviada!",
        description: "Obrigada pelo seu feedback.",
      });

      // Limpa formulário
      setRating(0);
      setComment("");
      setSelectedEventId(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao enviar avaliação. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-meninas bg-clip-text text-transparent mb-2">
            Meu Painel
          </h1>
          <p className="text-muted-foreground">
            Olá, {user?.name}! Gerencie suas inscrições e avaliações.
          </p>
        </div>

        <Tabs defaultValue="enrolled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="enrolled">
              <ListChecks className="w-4 h-4 mr-2" />
              Inscritos ({enrolledEvents.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="rate">
              <Star className="w-4 h-4 mr-2" />
              Avaliar ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* ABA INSCRITOS */}
          <TabsContent value="enrolled">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Próximos Eventos</h2>
              {enrolledEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledEvents.map((event) => (
                    <div key={event.id}>
                      <EventCard 
                         {...event}
                         // CORREÇÃO AQUI: Cast específico em vez de 'any'
                         type={event.type === 'oficina' ? 'workshop' : (event.type as "palestra" | "reuniao")}
                         vacancies={event.availableVacancies}
                         totalSlots={event.maxVacancies}
                      />
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
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">Você não tem inscrições ativas no momento.</p>
                  <Button variant="link" onClick={() => navigate("/events")}>
                    Explorar eventos disponíveis
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ABA CALENDÁRIO */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Eventos</CardTitle>
                <CardDescription>Seus próximos eventos organizados por data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledEvents.length > 0 ? (
                    enrolledEvents
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <Badge className="mt-1">{typeLabels[event.type] || event.type}</Badge>
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
                      ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhum evento agendado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA AVALIAR */}
          <TabsContent value="rate">
            <Card>
              <CardHeader>
                <CardTitle>Avaliar Eventos</CardTitle>
                <CardDescription>Deixe seu feedback sobre os eventos que participou</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pastEvents.length > 0 ? (
                    <div>
                      <Label className="mb-2 block">Selecione o evento para avaliar:</Label>
                      <div className="space-y-2 mb-6">
                        {pastEvents.map((event) => (
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
                              {new Date(event.date).toLocaleDateString('pt-BR')} - {typeLabels[event.type]}
                            </p>
                          </div>
                        ))}
                      </div>

                      {selectedEventId && (
                        <form onSubmit={handleSubmitRating} className="space-y-4 animate-fade-in">
                          <div className="space-y-2">
                            <Label>Sua Avaliação</Label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setRating(value)}
                                  className="focus:outline-none transition-transform hover:scale-110"
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
                              placeholder="O que você achou do evento? Compartilhe sua experiência..."
                              rows={4}
                              required
                            />
                          </div>

                          <Button type="submit" className="w-full" disabled={rating === 0 || isSubmitting}>
                            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                          </Button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Você ainda não tem eventos concluídos para avaliar.
                    </p>
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