import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, Users, Star, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Statistics = () => {
  // RF26-RF27: Estatísticas de eventos e inscritos
  const stats = {
    totalEvents: 24,
    totalEnrollments: 156,
    averageRating: 4.7,
    upcomingEvents: 8,
    completedEvents: 16,
    eventsByType: {
      workshop: 12,
      palestra: 8,
      reuniao: 4,
    },
    eventsByMonth: {
      "Jan": 5,
      "Fev": 7,
      "Mar": 6,
      "Abr": 4,
      "Mai": 2,
    },
    topEvents: [
      { name: "Introdução à Programação", enrollments: 28, rating: 4.9 },
      { name: "Robótica para Iniciantes", enrollments: 25, rating: 4.8 },
      { name: "Design Thinking", enrollments: 22, rating: 4.6 },
    ],
  };

  const handleExportReport = () => {
    // RF28: Exportar relatório estatístico
    const reportContent = `
Relatório Estatístico - Meninas Digitais UTFPR-CP
Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO GERAL
============
Total de Eventos: ${stats.totalEvents}
Total de Inscrições: ${stats.totalEnrollments}
Avaliação Média: ${stats.averageRating}/5.0
Eventos Futuros: ${stats.upcomingEvents}
Eventos Realizados: ${stats.completedEvents}

EVENTOS POR TIPO
================
Oficinas: ${stats.eventsByType.workshop}
Palestras: ${stats.eventsByType.palestra}
Reuniões: ${stats.eventsByType.reuniao}

EVENTOS POR MÊS
===============
${Object.entries(stats.eventsByMonth).map(([month, count]) => `${month}: ${count}`).join('\n')}

EVENTOS MAIS POPULARES
======================
${stats.topEvents.map((e, i) => `${i + 1}. ${e.name} - ${e.enrollments} inscrições - ${e.rating}★`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_estatistico_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    toast({ title: "Relatório exportado!", description: "O relatório estatístico foi exportado com sucesso." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-meninas bg-clip-text text-transparent mb-2">
              Estatísticas e Relatórios
            </h1>
            <p className="text-muted-foreground">Visualize dados e métricas dos eventos</p>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents} futuros, {stats.completedEvents} realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Média de {Math.round(stats.totalEnrollments / stats.totalEvents)} por evento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}/5.0</div>
              <p className="text-xs text-muted-foreground">
                Baseado em {stats.completedEvents} eventos avaliados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+23%</div>
              <p className="text-xs text-muted-foreground">
                Comparado ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="by-type" className="space-y-6">
          <TabsList>
            <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
            <TabsTrigger value="by-month">Por Mês</TabsTrigger>
            <TabsTrigger value="top-events">Mais Populares</TabsTrigger>
          </TabsList>

          <TabsContent value="by-type">
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Tipo</CardTitle>
                <CardDescription>Distribuição dos eventos cadastrados por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                      <span className="font-medium">Oficinas</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${(stats.eventsByType.workshop / stats.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stats.eventsByType.workshop}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-pink-500 to-orange-500"></div>
                      <span className="font-medium">Palestras</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-orange-500"
                          style={{ width: `${(stats.eventsByType.palestra / stats.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stats.eventsByType.palestra}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                      <span className="font-medium">Reuniões</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                          style={{ width: `${(stats.eventsByType.reuniao / stats.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stats.eventsByType.reuniao}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-month">
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Mês</CardTitle>
                <CardDescription>Quantidade de eventos realizados por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.eventsByMonth).map(([month, count]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="font-medium">{month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-64 h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-meninas"
                            style={{ width: `${(count / Math.max(...Object.values(stats.eventsByMonth))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-events">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Mais Populares</CardTitle>
                <CardDescription>Rankings baseados em número de inscrições e avaliações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topEvents.map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-meninas flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.enrollments} inscrições
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {event.rating}/5.0
                          </span>
                        </div>
                      </div>
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

export default Statistics;
