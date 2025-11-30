import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star, Loader2, User as UserIcon, Check } from "lucide-react"; // Adicionei Check
import { toast } from "@/hooks/use-toast";
import { eventAPI, enrollmentAPI, ratingAPI, userAPI, Event, Rating, User } from "@/services/api";
import { AxiosError } from "axios";

interface BackendEvent extends Event {
  max_vacancies?: number;
  inscriptions_count?: number;
  event_type?: string;
  start_time?: string;
  end_time?: string;
  host?: string; 
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userEnrollmentId, setUserEnrollmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const typeLabels: Record<string, string> = {
    oficina: "Oficina",
    workshop: "Oficina",
    palestra: "Palestra",
    reuniao: "Reunião",
    reuniao_interna: "Reunião Interna",
  };

  const typeColors: Record<string, string> = {
    oficina: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
    workshop: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
    palestra: "bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0",
    reuniao: "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0",
    reuniao_interna: "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0",
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        // 1. Busca evento
        const eventData = await eventAPI.getById(id);
        setEvent(eventData as unknown as BackendEvent);

        // 2. Busca avaliações
        try {
          const ratingsData = await ratingAPI.getByEvent(id);
          setRatings(ratingsData);
        } catch (error) {
          console.warn("Sem avaliações", error);
        }

        // 3. Busca usuário e verifica se ESTÁ INSCRITO
        try {
          const user = await userAPI.getCurrent();
          setCurrentUser(user);

          // Pega todas as inscrições do usuário e vê se este evento está lá
          const enrollments = await enrollmentAPI.getByUser(user.id);
          console.log("Inscrições encontradas:", enrollments);
          console.log("ID do Evento atual:", id);
          // Backend usa ID numérico, front string (comparação solta == resolve)
          const enrollment = enrollments.find(e => 
            String(e.event_id) === String(id) && e.status !== 'cancelled'
          );
          
          if (enrollment) {
            console.log("Usuário já está inscrito! ID:", enrollment.id);
            setUserEnrollmentId(enrollment.id);
          }
        } catch (error) {
          console.log("Visitante não logado");
        }

      } catch (error) {
        console.error("Erro fatal:", error);
        toast({
          variant: "destructive",
          title: "Evento não encontrado",
          description: "O evento que você procura não existe.",
        });
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleEnroll = async () => {
    if (!currentUser || !event) {
      toast({
        variant: "destructive",
        title: "Login necessário",
        description: "Faça login para se inscrever.",
      });
      navigate("/auth"); 
      return;
    }

    setIsProcessing(true);
    try {
      const enrollment = await enrollmentAPI.create(currentUser.id, String(event.id));
      setUserEnrollmentId(enrollment.id);
      
      setEvent(prev => prev ? { ...prev, inscriptions_count: (prev.inscriptions_count || 0) + 1 } : null);

      toast({
        title: "Sucesso!",
        description: "Inscrição realizada.",
      });
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ detail: string }>;
      const msg = axiosError.response?.data?.detail || "Erro ao realizar inscrição.";
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: msg,
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

  // --- CÁLCULOS E REGRAS DE NEGÓCIO ---
  const rawType = event.event_type || event.type || 'palestra';
  
  const totalVagas = event.max_vacancies || 0;
  const inscritos = event.inscriptions_count || 0;
  
  // Se totalVagas for 0, é Indisponível (0 disponíveis). Se > 0, calcula.
  const vagasDisponiveis = totalVagas > 0 ? Math.max(0, totalVagas - inscritos) : 0;
  
  const percentualOcupado = totalVagas > 0 ? Math.round((inscritos / totalVagas) * 100) : 100;
  
  // Estados do Botão
  const isUnavailable = totalVagas === 0; // Caso 0 vagas (Indisponível)
  const isFull = !isUnavailable && vagasDisponiveis === 0; // Caso Lotado

  const dateObj = event.start_time ? new Date(event.start_time) : new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
          className="mb-6 hover:bg-secondary/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <Badge className={`${typeColors[rawType] || "bg-primary"} mb-3 px-3 py-1 text-sm`}>
                      {typeLabels[rawType] || rawType}
                    </Badge>
                    <CardTitle className="text-3xl mb-2 leading-tight">{event.title}</CardTitle>
                    <CardDescription className="text-base flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {event.host || event.instructor || "Instrutor a definir"}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-border">
                    <Star className={`w-5 h-5 ${averageRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    <span className="font-bold text-lg">{averageRating > 0 ? averageRating.toFixed(1) : "-"}</span>
                    <span className="text-xs text-muted-foreground">
                      ({ratings.length} avaliações)
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    Sobre o Evento
                  </h3>
                  <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {event.description}
                  </div>
                </div>

                {event.requirements && (
                  <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                    <h3 className="font-semibold mb-2 text-secondary-foreground">Requisitos</h3>
                    <p className="text-sm text-muted-foreground">{event.requirements}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data</p>
                      <p className="font-semibold">{dateStr}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Horário</p>
                      <p className="font-semibold">{timeStr}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Local</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vagas</p>
                      <p className="font-semibold">
                        {/* Lógica de exibição de texto de vagas */}
                        {isUnavailable 
                          ? "Indisponível" 
                          : `${vagasDisponiveis} de ${totalVagas} disponíveis`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avaliações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="border-b last:border-0 pb-4">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Participante</span>
                          <span className="text-xs text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{rating.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6 text-sm">
                    Ainda não há avaliações.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* PAINEL DE INSCRIÇÃO */}
          <div>
            <Card className="sticky top-24 border-border shadow-lg">
              <CardHeader>
                <CardTitle>Inscrição</CardTitle>
                <CardDescription>Garanta sua participação agora</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Barra de Progresso (Só mostra se tiver vagas > 0) */}
                {totalVagas > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ocupação</span>
                      <span className="font-semibold">{percentualOcupado}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isFull ? 'bg-destructive' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                        style={{ width: `${percentualOcupado}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {isFull ? "Turma lotada!" : "Corra, as vagas estão acabando!"}
                    </p>
                  </div>
                )}

                {/* LOGICA DOS BOTÕES */}
                {userEnrollmentId ? (
                  // CASO 1: USUÁRIO JÁ INSCRITO
                  <Button
                    variant="secondary" // Ou outline, ou verde
                    className="w-full h-12 text-lg shadow-md bg-green-100 text-green-800 hover:bg-green-100 border-green-200 border"
                    disabled={true} // BLOQUEADO, não pode cancelar
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Inscrito
                  </Button>
                ) : (
                  // CASO 2: NÃO INSCRITO
                  <Button
                    className={`w-full h-12 text-lg shadow-md transition-all 
                      ${(isFull || isUnavailable) ? 'opacity-80 cursor-not-allowed bg-muted text-muted-foreground' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'}`}
                    onClick={handleEnroll}
                    disabled={isProcessing || isFull || isUnavailable}
                  >
                    {isProcessing 
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscrevendo...</>
                      : isUnavailable ? "Indisponível" 
                      : isFull ? "Esgotado" 
                      : "Inscrever-se"
                    }
                  </Button>
                )}
                
                {!currentUser && !userEnrollmentId && (
                  <p className="text-xs text-center text-muted-foreground">
                    Você será redirecionado para login/cadastro.
                  </p>
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