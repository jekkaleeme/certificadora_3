import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mock data - seria substituído por dados reais
  const event = {
    id: id || "1",
    title: "Introdução à Programação em Python",
    type: "workshop" as const,
    date: "2024-02-15",
    time: "14:00",
    location: "Laboratório 1 - Bloco A",
    vacancies: 8,
    totalSlots: 20,
    description: "Aprenda os fundamentos da programação com Python. Esta oficina é perfeita para iniciantes que desejam entrar no mundo da programação. Vamos cobrir variáveis, estruturas de controle, funções e muito mais!",
    instructor: "Profa. Dra. Maria Silva",
    requirements: "Computador com Python 3.x instalado",
  };

  const typeLabels: Record<string, string> = {
    workshop: "Oficina",
    palestra: "Palestra",
    reuniao: "Reunião",
  };

  const typeColors: Record<string, string> = {
    workshop: "bg-gradient-to-r from-purple-500 to-pink-500",
    palestra: "bg-gradient-to-r from-pink-500 to-orange-500",
    reuniao: "bg-gradient-to-r from-orange-500 to-yellow-500",
  };

  const mockRatings = [
    { id: "1", userName: "Ana Costa", rating: 5, comment: "Oficina excelente! Aprendi muito.", createdAt: "2024-01-20" },
    { id: "2", userName: "Julia Santos", rating: 4, comment: "Muito bom, conteúdo bem explicado.", createdAt: "2024-01-21" },
  ];

  const handleEnroll = () => {
    setIsEnrolled(true);
    toast({
      title: "Inscrição realizada!",
      description: "Você foi inscrito no evento com sucesso.",
    });
  };

  const handleCancelEnrollment = () => {
    setIsEnrolled(false);
    toast({
      title: "Inscrição cancelada",
      description: "Sua inscrição foi cancelada com sucesso.",
    });
  };

  const averageRating = mockRatings.reduce((acc, r) => acc + r.rating, 0) / mockRatings.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
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
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={`${typeColors[event.type]} mb-2`}>
                      {typeLabels[event.type]}
                    </Badge>
                    <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                    <CardDescription className="text-base">
                      Ministrado por {event.instructor}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({mockRatings.length} avaliações)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Sobre o Evento</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requisitos</h3>
                  <p className="text-muted-foreground">{event.requirements}</p>
                </div>

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
                        {event.vacancies}/{event.totalSlots} disponíveis
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
                {mockRatings.map((rating) => (
                  <div key={rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{rating.userName}</p>
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
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Inscrição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vagas disponíveis</span>
                    <span className="font-semibold">{event.vacancies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de vagas</span>
                    <span className="font-semibold">{event.totalSlots}</span>
                  </div>
                </div>

                {event.vacancies > 0 && (
                  <>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-meninas h-2 rounded-full transition-all"
                        style={{
                          width: `${((event.totalSlots - event.vacancies) / event.totalSlots) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {Math.round(((event.totalSlots - event.vacancies) / event.totalSlots) * 100)}% preenchido
                    </p>
                  </>
                )}

                {isEnrolled ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelEnrollment}
                  >
                    Cancelar Inscrição
                  </Button>
                ) : event.vacancies > 0 ? (
                  <Button
                    className="w-full"
                    onClick={handleEnroll}
                  >
                    Inscrever-se
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
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
