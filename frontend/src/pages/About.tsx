import { Users, Target, GraduationCap, Heart, Instagram } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const About = () => {
  const objectives = [
    {
      icon: Target,
      title: "Nosso Objetivo",
      description: "Contribuir para o aumento da participação de meninas e mulheres em computação e STEM, incentivando estudantes do ensino fundamental e médio a seguirem carreira nessas áreas."
    },
    {
      icon: GraduationCap,
      title: "Nossa Estratégia",
      description: "Ensino de temas em computação e STEM voltados à resolução de desafios de sustentabilidade, através de oficinas, palestras, minicursos e mesas redondas."
    },
    {
      icon: Heart,
      title: "Nosso Impacto",
      description: "Contribuir para a redução da desigualdade de gênero, tornando o ambiente mais igualitário, diverso e inclusivo, ampliando perspectivas de trabalho e auxiliando na independência através da educação de qualidade."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-meninas bg-clip-text text-transparent">
              Sobre o Projeto Meninas Digitais
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              UTFPR - Campus Cornélio Procópio
            </p>
            <p className="text-sm text-muted-foreground">
              Coordenação: Profª Rosangela de Fátima Pereira Marquesone
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-12 border-2 border-primary/20 shadow-elegant animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Nossa Missão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground leading-relaxed">
                O Projeto de Extensão "Meninas Digitais - UTFPR-CP" visa contribuir para o aumento da 
                participação de meninas e mulheres em computação e STEM (ciência, tecnologia, engenharia 
                e matemática), incentivando e auxiliando meninas estudantes de ensino fundamental e médio 
                de Cornélio Procópio a seguirem carreira nessas áreas.
              </p>
            </CardContent>
          </Card>

          {/* Objectives Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {objectives.map((objective, index) => (
              <Card 
                key={index} 
                className="hover-scale border-border/50 shadow-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-meninas flex items-center justify-center mb-4">
                    <objective.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{objective.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{objective.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Target Audience */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Quem Pode Participar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Meninas e Mulheres</h4>
                  <p className="text-muted-foreground">
                    • Meninas de 12 a 18 anos (ensino fundamental e médio)<br />
                    • Mulheres de 19 a 59 anos
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Colégios Parceiros</h4>
                  <p className="text-muted-foreground">
                    Estudantes de colégios parceiros terão acesso aos eventos do projeto, 
                    com oportunidade de conhecer a UTFPR-CP e disseminar o conhecimento adquirido.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  Processo Seletivo para Voluntários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Estudantes de cursos ofertados pela UTFPR-CP, independente do gênero, 
                  podem participar do processo seletivo para contribuir com:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Produção de material</li>
                  <li>Marketing</li>
                  <li>Administração</li>
                  <li>Realização de minicursos, palestras e oficinas</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-meninas text-white shadow-elegant">
            <CardContent className="py-12 text-center">
              <h3 className="text-3xl font-bold mb-4">Siga-nos no Instagram</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Acompanhe nossas atividades, eventos e novidades do projeto
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2"
                onClick={() => window.open('https://www.instagram.com/meninasdigitaisutfprcp/', '_blank')}
              >
                <Instagram className="w-5 h-5" />
                @meninasdigitaisutfprcp
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Meninas Digitais - UTFPR-CP. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
