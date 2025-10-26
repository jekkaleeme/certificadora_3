import { useState } from "react";
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
import { Calendar, Plus, Users, Star, Trash2 } from "lucide-react";
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
  isPrivate: boolean; // RF14: Eventos públicos ou privados
  materials?: string; // RF34: Materiais complementares (links ou anexos)
  instructor?: string;
  requirements?: string;
}

interface Enrollment {
  id: string;
  eventId: string;
  userName: string;
  userEmail: string;
  enrolledAt: string;
}

interface Rating {
  id: string;
  eventId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const mockEnrollments: Enrollment[] = [
  { id: "1", eventId: "1", userName: "Maria Silva", userEmail: "maria@example.com", enrolledAt: "2024-01-15" },
  { id: "2", eventId: "1", userName: "Ana Santos", userEmail: "ana@example.com", enrolledAt: "2024-01-16" },
];

const mockRatings: Rating[] = [
  { id: "1", eventId: "1", userName: "Maria Silva", rating: 5, comment: "Excelente oficina!", createdAt: "2024-01-20" },
  { id: "2", eventId: "1", userName: "Ana Santos", rating: 4, comment: "Muito bom, aprendi bastante.", createdAt: "2024-01-21" },
];

const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "workshop" as "workshop" | "palestra" | "reuniao",
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

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // RF32: Validar conflitos de horário
    const hasConflict = events.some(existing => 
      existing.date === newEvent.date && 
      existing.time === newEvent.time && 
      (existing.location === newEvent.location || existing.instructor === newEvent.instructor)
    );
    
    if (hasConflict) {
      toast({
        title: "Conflito de horário detectado!",
        description: "Já existe um evento no mesmo horário e local ou com o mesmo instrutor.",
        variant: "destructive",
      });
      return;
    }
    
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      vacancies: parseInt(newEvent.totalSlots),
      totalSlots: parseInt(newEvent.totalSlots),
      description: newEvent.description,
      isPrivate: newEvent.isPrivate,
      materials: newEvent.materials || undefined,
      instructor: newEvent.instructor || undefined,
      requirements: newEvent.requirements || undefined,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      type: "workshop",
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

    toast({
      title: "Evento criado!",
      description: "O evento foi criado com sucesso.",
    });
  };

  const handleRemoveEnrollment = (enrollmentId: string) => {
    toast({
      title: "Inscrição removida",
      description: "A inscrição foi removida com sucesso.",
    });
  };

  const typeLabels = {
    workshop: "Oficina",
    lecture: "Palestra",
    meeting: "Reunião",
  };

  const typeColors = {
    workshop: "bg-gradient-to-r from-purple-500 to-pink-500",
    lecture: "bg-gradient-to-r from-pink-500 to-orange-500",
    meeting: "bg-gradient-to-r from-orange-500 to-yellow-500",
  };

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
              Eventos
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
                        onValueChange={(value: "workshop" | "palestra" | "reuniao") =>
                          setNewEvent({ ...newEvent, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workshop">Oficina</SelectItem>
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
                    <Label htmlFor="materials">Materiais Complementares (RF34)</Label>
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
                      Evento privado (RF14, RF20 - apenas para membros autenticados)
                    </Label>
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Evento
                  </Button>
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
                    Nenhum evento criado ainda.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge className={typeColors[event.type]}>
                              {typeLabels[event.type]}
                            </Badge>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span>📅 {event.date}</span>
                          <span>🕒 {event.time}</span>
                          <span>📍 {event.location}</span>
                          <span>👥 {event.vacancies}/{event.totalSlots} vagas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Inscrições</CardTitle>
                <CardDescription>Visualize e gerencie as inscrições nos eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Inscrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.userName}</TableCell>
                        <TableCell>{enrollment.userEmail}</TableCell>
                        <TableCell>{enrollment.enrolledAt}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações dos Eventos</CardTitle>
                <CardDescription>Visualize os feedbacks dos participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRatings.map((rating) => (
                    <div key={rating.id} className="border rounded-lg p-4">
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
                        <span className="text-sm text-muted-foreground">{rating.createdAt}</span>
                      </div>
                      <p className="text-sm">{rating.comment}</p>
                    </div>
                  ))}
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
