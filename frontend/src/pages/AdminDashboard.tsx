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
import { Calendar, Plus, Users, Star, Trash2, Loader2, Clock, MapPin, Pencil, X } from "lucide-react"; // <--- Adicionado Pencil e X
import { toast } from "@/hooks/use-toast";
import { eventAPI, enrollmentAPI, ratingAPI, Event } from "@/services/api";
import { AxiosError } from "axios";

// Interface para ler propriedades do Python
interface BackendEvent extends Event {
  max_vacancies?: number;
  inscriptions_count?: number;
  event_type?: string;
  start_time?: string;
  end_time?: string;
  host?: string;
}

interface EnrollmentDisplay {
  id: string;
  eventName: string;
  userId: string;
  userName?: string; 
  userEmail?: string;
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

  // Estado para controle de Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("create"); // Controle da Tab ativa

  // Estado do formulário
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "oficina" as "oficina" | "palestra" | "reuniao",
    date: "",
    time: "",
    endTime: "", 
    location: "",
    totalSlots: "",
    description: "",
    isPrivate: false,
    materials: "",
    instructor: "",
    requirements: "",
  });

  const typeLabels: Record<string, string> = {
    oficina: "Oficina",
    palestra: "Palestra",
    reuniao: "Reunião",
    workshop: "Oficina",
    reuniao_interna: "Reunião Interna"
  };

  const typeColors: Record<string, string> = {
    oficina: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
    palestra: "bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0",
    reuniao: "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0",
    reuniao_interna: "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0",
    workshop: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const allEvents = await eventAPI.getAll();
      setEvents(allEvents);

      const enrollmentsPromises = allEvents.map(async (ev) => {
        try {
          const result = await enrollmentAPI.getByEvent(ev.id);
          return result.map(enr => ({
            id: enr.id,
            eventName: ev.title,
            userId: enr.userId,
            // MAPEAMENTO DOS DADOS DO USUÁRIO (Vem do Backend)
            // @ts-expect-error (O TS pode não ver esses campos se não estiverem na interface Enrollment do api.ts, mas o backend manda)
            userName: enr.user_name || enr.guest_name || "Anônimo",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            userEmail: enr.user_email || enr.guest_email || "-",
            status: enr.status || "confirmed" // Default para confirmado se vier vazio
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

      setEnrollmentsList(allEnrollmentsResults.flat());
      setRatingsList(allRatingsResults.flat());

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Falha ao buscar dados do servidor."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE POPULAR FORMULÁRIO (EDITAR) ---
  const handleEditClick = (event: Event) => {
    const backendEvent = event as unknown as BackendEvent;
    
    // 1. Converter UTC (do backend) para DATA LOCAL para os inputs
    
    let datePart = "";
    let startTimePart = "";
    let endTimePart = "";

    // Função auxiliar para garantir formato HH:MM
    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Função auxiliar para garantir formato YYYY-MM-DD
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Se tiver start_time (vem do backend), usa ele. Senão tenta usar date/time legado
    if (backendEvent.start_time) {
        datePart = formatDate(backendEvent.start_time); 
        startTimePart = formatTime(backendEvent.start_time);
    } else {
        datePart = event.date;
        startTimePart = event.time;
    }
    
    if (backendEvent.end_time) {
        endTimePart = formatTime(backendEvent.end_time);
    }

    let formType: "oficina" | "palestra" | "reuniao" = "oficina";
    const rawType = backendEvent.event_type || event.type;
    if (rawType === 'palestra') formType = 'palestra';
    else if (rawType === 'reuniao_interna' || rawType === 'reuniao') formType = 'reuniao';

    setNewEvent({
      title: event.title,
      type: formType,
      date: datePart,
      time: startTimePart,
      endTime: endTimePart,
      location: event.location,
      description: event.description,
      totalSlots: String(backendEvent.max_vacancies || 0),
      isPrivate: !event.isPrivate, 
      materials: "", 
      // CORREÇÃO AQUI: Pega host se instructor for vazio
      instructor: event.instructor || backendEvent.host || "",
      requirements: "", 
    });

    setEditingId(event.id); 
    setActiveTab("create"); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewEvent({
      title: "",
      type: "oficina",
      date: "",
      time: "",
      endTime: "",
      location: "",
      totalSlots: "",
      description: "",
      isPrivate: false,
      materials: "",
      instructor: "",
      requirements: "",
    });
  };

  // --- SUBMIT UNIFICADO (CRIAR OU EDITAR) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: newEvent.title,
        type: newEvent.type,
        date: newEvent.date,
        time: newEvent.time,
        endTime: newEvent.endTime,
        location: newEvent.location,
        
        description: newEvent.requirements 
          ? `${newEvent.description}\n\nRequisitos: ${newEvent.requirements}`
          : newEvent.description,
          
        maxVacancies: newEvent.totalSlots, 
        instructor: newEvent.instructor,
        isPrivate: newEvent.isPrivate,
        materials: newEvent.materials
      };

      if (editingId) {
        // MODO EDIÇÃO
        await eventAPI.update(editingId, payload);
        toast({ title: "Evento atualizado!", description: "As alterações foram salvas." });
      } else {
        // MODO CRIAÇÃO
        await eventAPI.create(payload);
        toast({ title: "Evento criado!", description: "O evento foi salvo no banco." });
      }

      handleCancelEdit(); // Limpa form e sai do modo edição
      loadAllData(); // Recarrega lista

    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ detail: string }>;
      const msg = axiosError.response?.data?.detail || "Verifique os dados e tente novamente.";
      
      toast({
        variant: "destructive",
        title: editingId ? "Erro ao atualizar" : "Erro ao criar",
        description: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      await eventAPI.delete(id);
      toast({ title: "Evento excluído" });
      loadAllData(); 
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir" });
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm("Deseja cancelar esta inscrição?")) return;
    try {
      await enrollmentAPI.cancel(enrollmentId);
      toast({ title: "Inscrição removida" });
      loadAllData();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao remover" });
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

        {/* Controle de Tabs com Estado para permitir troca automática */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Editar Evento" : "Criar Evento"}
            </TabsTrigger>
            <TabsTrigger value="events"><Calendar className="w-4 h-4 mr-2" />Eventos</TabsTrigger>
            <TabsTrigger value="enrollments"><Users className="w-4 h-4 mr-2" />Inscrições</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Editar Evento" : "Criar Novo Evento"}</CardTitle>
                <CardDescription>
                  {editingId ? "Altere os dados abaixo e salve" : "Preencha os dados do novo evento"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ... (CAMPOS DO FORMULÁRIO - IGUAIS AO ANTERIOR) ... */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2">
                        <Label htmlFor="title">Título do Evento</Label>
                        <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Evento</Label>
                        <Select value={newEvent.type} onValueChange={(value: "oficina" | "palestra" | "reuniao") => setNewEvent({ ...newEvent, type: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="oficina">Oficina</SelectItem>
                            <SelectItem value="palestra">Palestra</SelectItem>
                            <SelectItem value="reuniao">Reunião</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="time">Início</Label>
                            <Input id="time" type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Fim</Label>
                            <Input id="endTime" type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Local</Label>
                        <Input id="location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalSlots">Número de Vagas</Label>
                        <Input id="totalSlots" type="number" min="0" value={newEvent.totalSlots} onChange={(e) => setNewEvent({ ...newEvent, totalSlots: e.target.value })} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={4} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instrutor/Palestrante</Label>
                    <Input id="instructor" value={newEvent.instructor} onChange={(e) => setNewEvent({ ...newEvent, instructor: e.target.value })} placeholder="Nome do instrutor" />
                  </div>

                    <div className="space-y-2">
                        <Label htmlFor="materials">Materiais Complementares</Label>
                        <Input id="materials" value={newEvent.materials} onChange={(e) => setNewEvent({ ...newEvent, materials: e.target.value })} placeholder="Link para materiais" />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isPrivate" checked={newEvent.isPrivate} onChange={(e) => setNewEvent({ ...newEvent, isPrivate: e.target.checked })} className="rounded border-gray-300" />
                        <Label htmlFor="isPrivate" className="cursor-pointer">Evento privado</Label>
                    </div>
                  
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {editingId ? "Salvar Alterações" : "Criar Evento"}
                    </Button>
                    
                    {editingId && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

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
                    {events.map((event) => {
                      const backendEvent = event as unknown as BackendEvent;
                      const rawType = backendEvent.event_type || event.type || 'palestra';
                      
                      const dateObj = backendEvent.start_time 
                        ? new Date(backendEvent.start_time) 
                        : new Date(event.date);
                      const dateStr = dateObj.toLocaleDateString('pt-BR');
                      const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                      const totalVagas = backendEvent.max_vacancies || 0;
                      const inscritos = backendEvent.inscriptions_count || 0;
                      const disponiveis = Math.max(0, totalVagas - inscritos);

                      return (
                        <div key={event.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <Badge variant="outline" className={`${typeColors[rawType] || "bg-primary text-white border-0"}`}>
                                  {typeLabels[rawType] || rawType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                            </div>
                            <div className="flex gap-2">
                                {/* BOTÃO DE EDITAR ADICIONADO */}
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleEditClick(event)}
                                    title="Editar Evento"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    title="Excluir Evento"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{timeStr}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="truncate max-w-[100px]" title={event.location}>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4 text-primary" />
                              <span className={disponiveis === 0 && totalVagas > 0 ? "text-destructive font-medium" : ""}>
                                {totalVagas > 0 ? `${disponiveis}/${totalVagas} vagas` : "Indisponível"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Inscrições</CardTitle>
                <CardDescription>
                  Acompanhe quem vai participar dos seus eventos ({enrollmentsList.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participante</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollmentsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                          Nenhuma inscrição encontrada no sistema.
                        </TableCell>
                      </TableRow>
                    ) : (
                      enrollmentsList.map((enrollment) => (
                        <TableRow key={enrollment.id} className="hover:bg-muted/5">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{enrollment.userName}</span>
                              <span className="text-xs text-muted-foreground">{enrollment.userEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-muted-foreground">
                            {enrollment.eventName}
                          </TableCell>
                          <TableCell>
                             <Badge variant={enrollment.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                                {enrollment.status === 'confirmed' ? 'Confirmado' : enrollment.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveEnrollment(enrollment.id)}
                              title="Cancelar Inscrição"
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

        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;