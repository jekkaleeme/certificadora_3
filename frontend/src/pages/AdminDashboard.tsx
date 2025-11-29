import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { eventAPI, enrollmentAPI, ratingAPI, Event } from "@/services/api";

// Interfaces auxiliares para exibição na tabela (Juntando dados de IDs com Textos)
interface EnrollmentDisplay {
  id: string;
  eventName: string;
  userId: string; // A API atual retorna ID, em um app real buscaríamos o nome do usuário
  status: string;
}

interface RatingDisplay {
  id: string;
  eventName: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [enrollmentsList, setEnrollmentsList] = useState<EnrollmentDisplay[]>([]);
  const [ratingsList, setRatingsList] = useState<RatingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado do formulário
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "oficina" as "oficina" | "palestra" | "reuniao", // Padrão do backend
    date: "",
    time: "",
    location: "",
    totalSlots: "",
    description: "",
    isPrivate: false,
    materials: "",
    instructor: "",
    requirements: "",
  });

  // Mapas de tradução
  const typeLabels: Record<string, string> = {
    oficina: "Oficina",
    palestra: "Palestra",
    reuniao: "Reunião",
    workshop: "Oficina"
  };

  const typeColors: Record<string, string> = {
    oficina: "bg-gradient-to-r from-purple-500 to-pink-500",
    palestra: "bg-gradient-to-r from-pink-500 to-orange-500",
    reuniao: "bg-gradient-to-r from-orange-500 to-yellow-500",
    workshop: "bg-gradient-to-r from-purple-500 to-pink-500"
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Busca Eventos
      const allEvents = await eventAPI.getAll();
      setEvents(allEvents);

      // 2. Busca Inscrições e Avaliações de cada evento (Para popular as abas de admin)
      // Nota: Idealmente o backend teria uma rota /admin/enrollments, mas vamos iterar pelos eventos
      const enrollmentsPromises = allEvents.map(async (ev) => {
        try {
          const result = await enrollmentAPI.getByEvent(ev.id);
          return result.map(enr => ({
            id: enr.id,
            eventName: ev.title,
            userId: enr.userId,
            status: enr.status
          }));
        } catch { return []; }
      });

      const ratingsPromises = allEvents.map(async (ev) => {
        try {
          const result = await ratingAPI.getByEvent(ev.id);
          return result.map(rt => ({
            id: rt.id,
            eventName: ev.title,
            userId: rt.userId,
            rating: rt.rating,
            comment: rt.comment,
            createdAt: rt.createdAt
          }));
        } catch { return []; }
      });

      const allEnrollmentsResults = await Promise.all(enrollmentsPromises);
      const allRatingsResults = await Promise.all(ratingsPromises);

      // Flat map para juntar todos os arrays em um só
      setEnrollmentsList(allEnrollmentsResults.flat());
      setRatingsList(allRatingsResults.flat());

    } catch (error) {
      console.error("Erro ao carregar dados do admin:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Falha ao buscar dados do servidor."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // RF32: Validação simples de conflito no front (poderia ser no back também)
    const hasConflict = events.some(existing => 
      existing.date === newEvent.date && 
      existing.time === newEvent.time && 
      existing.location === newEvent.location
    );
    
    if (hasConflict) {
      toast({
        title: "Conflito de horário",
        description: "Já existe um evento neste horário e local.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepara o objeto para a API
      const payload = {
        title: newEvent.title,
        type: newEvent.type, // Já está tipado corretamente como "oficina" | "palestra" | "reuniao"
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description,
        isPrivate: newEvent.isPrivate,
        materials: newEvent.materials || undefined,
        instructor: newEvent.instructor || undefined,
        requirements: newEvent.requirements || undefined,
        // Backend espera maxVacancies e availableVacancies
        maxVacancies: parseInt(newEvent.totalSlots),
        availableVacancies: parseInt(newEvent.totalSlots), 
      };

      await eventAPI.create(payload);

      toast({
        title: "Evento criado!",
        description: "O evento foi salvo no banco de dados.",
      });

      // Limpa form
      setNewEvent({
        title: "",
        type: "oficina",
        date: "",
        time: "",
        location: "",
        totalSlots: "",
        description: "",
        isPrivate: false,
        materials: "",
        instructor: "",
        requirements: "",
      });

      // Recarrega lista
      loadAllData();

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao criar",
        description: "Verifique os dados e tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    try {
      await eventAPI.delete(id);
      toast({
        title: "Evento excluído",
        description: "O evento foi removido com sucesso."
      });
      loadAllData(); // Recarrega a lista
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o evento."
      });
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm("Deseja cancelar esta inscrição?")) return;
    try {
      await enrollmentAPI.cancel(enrollmentId);
      toast({ title: "Inscrição removida com sucesso" });
      loadAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro ao remover inscrição" });
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-meninas bg-clip-text text-transparent mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">Gerencie eventos, inscrições e avaliações</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Eventos ({events.length})
            </TabsTrigger>
            <TabsTrigger value="enrollments">
              <Users className="w-4 h-4 mr-2" />
              Inscrições
            </TabsTrigger>
            <TabsTrigger value="ratings">
              <Star className="w-4 h-4 mr-2" />
              Avaliações
            </TabsTrigger>
          </TabsList>

          {/* ABA CRIAR */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Evento</CardTitle>
                <CardDescription>Preencha os dados do novo evento</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Evento</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Evento</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value: "oficina" | "palestra" | "reuniao") =>
                          setNewEvent({ ...newEvent, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oficina">Oficina</SelectItem>
                          <SelectItem value="palestra">Palestra</SelectItem>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalSlots">Número de Vagas</Label>
                      <Input
                        id="totalSlots"
                        type="number"
                        min="1"
                        value={newEvent.totalSlots}
                        onChange={(e) => setNewEvent({ ...newEvent, totalSlots: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instrutor/Palestrante</Label>
                    <Input
                      id="instructor"
                      value={newEvent.instructor}
                      onChange={(e) => setNewEvent({ ...newEvent, instructor: e.target.value })}
                      placeholder="Nome do instrutor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requisitos</Label>
                    <Textarea
                      id="requirements"
                      value={newEvent.requirements}
                      onChange={(e) => setNewEvent({ ...newEvent, requirements: e.target.value })}
                      rows={2}
                      placeholder="Pré-requisitos para participação"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="materials">Materiais Complementares</Label>
                    <Input
                      id="materials"
                      value={newEvent.materials}
                      onChange={(e) => setNewEvent({ ...newEvent, materials: e.target.value })}
                      placeholder="Links para materiais, slides, recursos extras"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={newEvent.isPrivate}
                      onChange={(e) => setNewEvent({ ...newEvent, isPrivate: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isPrivate" className="cursor-pointer">
                      Evento privado
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Criar Evento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA EVENTOS */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Criados</CardTitle>
                <CardDescription>Gerencie todos os eventos do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum evento criado ainda. Use a aba "Criar Evento".
                  </p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge className={typeColors[event.type] || "bg-primary"}>
                              {typeLabels[event.type] || event.type}
                            </Badge>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                          <span>🕒 {event.time}</span>
                          <span>📍 {event.location}</span>
                          {/* Nota: Usamos maxVacancies da API */}
                          <span>👥 {event.availableVacancies}/{event.maxVacancies} vagas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA INSCRIÇÕES */}
          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Inscrições</CardTitle>
                <CardDescription>Todas as inscrições ativas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evento</TableHead>
                      <TableHead>ID Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollmentsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhuma inscrição encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      enrollmentsList.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.eventName}</TableCell>
                          <TableCell className="text-xs">{enrollment.userId}</TableCell>
                          <TableCell>
                             <Badge variant={enrollment.status === 'confirmed' ? 'default' : 'secondary'}>
                                {enrollment.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveEnrollment(enrollment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA AVALIAÇÕES */}
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações dos Eventos</CardTitle>
                <CardDescription>Visualize os feedbacks dos participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratingsList.length === 0 ? (
                     <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda.</p>
                  ) : (
                    ratingsList.map((rating) => (
                      <div key={rating.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">Evento: {rating.eventName}</p>
                            <p className="text-xs text-muted-foreground">User ID: {rating.userId}</p>
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
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm italic">"{rating.comment}"</p>
                      </div>
                    ))
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

export default AdminDashboard;