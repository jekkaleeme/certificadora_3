import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { eventAPI, enrollmentAPI, ratingAPI, userAPI, Event, Rating, User } from "@/services/api";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para dados da API
  const [event, setEvent] = useState<Event | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userEnrollmentId, setUserEnrollmentId] = useState<string | null>(null); // Se não nulo, usuário está inscrito
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Para o loading do botão

  // Mapas de cores e labels ajustados para o padrão da API (oficina, palestra, reuniao)
  const typeLabels: Record<string, string> = {
    oficina: "Oficina",
    palestra: "Palestra",
    reuniao: "Reunião",
  };

  const typeColors: Record<string, string> = {
    oficina: "bg-gradient-to-r from-purple-500 to-pink-500",
    palestra: "bg-gradient-to-r from-pink-500 to-orange-500",
    reuniao: "bg-gradient-to-r from-orange-500 to-yellow-500",
  };

  // Carrega todos os dados necessários
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        // 1. Busca detalhes do evento
        const eventData = await eventAPI.getById(id);
        setEvent(eventData);

        // 2. Busca avaliações
        try {
          const ratingsData = await ratingAPI.getByEvent(id);
          setRatings(ratingsData);
        } catch (error) {
          console.warn("Não foi possível carregar avaliações", error);
        }

        // 3. Busca usuário atual e verifica se ele já está inscrito
        try {
          const user = await userAPI.getCurrent();
          setCurrentUser(user);

          // Verifica nas inscrições do usuário se este evento está lá
          const enrollments = await enrollmentAPI.getByUser(user.id);
          const enrollment = enrollments.find(e => e.eventId === id && e.status !== 'cancelled');
          
          if (enrollment) {
            setUserEnrollmentId(enrollment.id);
          }
        } catch (error) {
          // Usuário provavelmente não está logado, tudo bem
          console.log("Usuário não logado ou erro ao buscar sessão");
        }

      } catch (error) {
        console.error("Erro ao carregar evento:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os detalhes do evento.",
        });
        navigate("/events"); // Volta se der erro fatal
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Ação de Inscrever
  const handleEnroll = async () => {
    if (!currentUser || !event) {
      toast({
        variant: "destructive",
        title: "Login necessário",
        description: "Você precisa entrar na sua conta para se inscrever.",
      });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    try {
      const enrollment = await enrollmentAPI.create(currentUser.id, event.id);
      setUserEnrollmentId(enrollment.id);
      
      // Atualiza visualmente as vagas (opcional, pois o ideal seria refazer o fetch)
      setEvent(prev => prev ? { ...prev, availableVacancies: prev.availableVacancies - 1 } : null);

      toast({
        title: "Inscrição realizada!",
        description: "Você garantiu sua vaga com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na inscrição",
        description: "Não foi possível realizar a inscrição. Tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Ação de Cancelar Inscrição
  const handleCancelEnrollment = async () => {
    if (!userEnrollmentId) return;

    setIsProcessing(true);
    try {
      await enrollmentAPI.cancel(userEnrollmentId);
      setUserEnrollmentId(null);
      
      // Devolve a vaga visualmente
      setEvent(prev => prev ? { ...prev, availableVacancies: prev.availableVacancies + 1 } : null);

      toast({
        title: "Inscrição cancelada",
        description: "Sua vaga foi liberada.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar sua inscrição.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  const averageRating = ratings.length > 0 
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <Badge className={`${typeColors[event.type] || "bg-primary"} mb-2`}>
                      {typeLabels[event.type] || event.type}
                    </Badge>
                    <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                    <CardDescription className="text-base">
                      {event.instructor ? `Ministrado por ${event.instructor}` : "Instrutor a definir"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
                    <Star className={`w-5 h-5 ${averageRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    <span className="font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : "-"}</span>
                    <span className="text-sm text-muted-foreground">
                      ({ratings.length} avaliações)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Sobre o Evento</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
                </div>

                {event.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Requisitos</h3>
                    <p className="text-muted-foreground">{event.requirements}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vagas</p>
                      <p className="font-medium">
                        {event.availableVacancies}/{event.maxVacancies} disponíveis
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <div key={rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {/* A API de rating atual não retorna o nome do usuário, usamos genérico */}
                          <p className="font-semibold">Participante</p> 
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rating.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Este evento ainda não tem avaliações.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Inscrição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vagas disponíveis</span>
                    <span className="font-semibold">{event.availableVacancies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de vagas</span>
                    <span className="font-semibold">{event.maxVacancies}</span>
                  </div>
                </div>

                {event.availableVacancies >= 0 && (
                  <>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${((event.maxVacancies - event.availableVacancies) / event.maxVacancies) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {Math.round(((event.maxVacancies - event.availableVacancies) / event.maxVacancies) * 100)}% preenchido
                    </p>
                  </>
                )}

                {userEnrollmentId ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelEnrollment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processando..." : "Cancelar Inscrição"}
                  </Button>
                ) : event.availableVacancies > 0 ? (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    onClick={handleEnroll}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processando..." : "Inscrever-se"}
                  </Button>
                ) : (
                  <Button className="w-full" disabled variant="secondary">
                    Esgotado
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;