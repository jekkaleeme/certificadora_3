import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { userAPI } from "@/services/api"; // Importamos nossa API

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados para Cadastro
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Estados para Reset de Senha
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Chama o backend (Python)
      await userAPI.login(loginEmail, loginPassword);
      
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta.",
      });

      // Redireciona para a Home (ou Dashboard)
      navigate("/"); 
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Email ou senha incorretos. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE CADASTRO ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepara os dados do usuário (Padrão role: 'user')
      await userAPI.register({
        name: signupName,
        email: signupEmail,
        role: "user", 
        // Você pode adicionar outros campos aqui se seu formulário tiver (age, phone, etc)
      });

      toast({
        title: "Conta criada!",
        description: "Faça login para continuar.",
      });

      // Limpa os campos e força a troca para a aba de login
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      // Opcional: setTab("login") se você controlar a tab via state
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Verifique se o email já está em uso ou tente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // RF25: Redefinição de senha (Mantido mock por enquanto, ou integre se tiver endpoint)
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Chamar userAPI.forgotPassword(resetEmail) se existir no backend
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
          <span className="text-2xl font-bold text-foreground">Meninas Digitais</span>
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

              {/* FORMULÁRIO DE LOGIN */}
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
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                          Digite seu email para receber instruções de redefinição de senha
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

              {/* FORMULÁRIO DE CADASTRO */}
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
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
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
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
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
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
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