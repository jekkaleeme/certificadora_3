import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement signup logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  // RF25: Redefinição de senha
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement password reset logic with backend
    setTimeout(() => {
      setIsLoading(false);
      setIsResetDialogOpen(false);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Calendar className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">EventHub</span>
        </Link>

        <Card className="border-border shadow-card-hover">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Gerencie seus eventos de forma simples e eficiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 shadow-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                  
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="w-full text-sm text-muted-foreground">
                        Esqueceu sua senha?
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Redefinir Senha</DialogTitle>
                        <DialogDescription>
                          Digite seu email para receber instruções de redefinição de senha (RF25)
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordReset}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="seu@email.com"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Enviando..." : "Enviar Email"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-secondary hover:opacity-90 shadow-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
