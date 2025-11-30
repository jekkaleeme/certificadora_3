import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2, Download, Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, userAPI, User } from "@/services/api";
import * as XLSX from 'xlsx';

// Interface local para o formulário
interface UserFormData {
  name: string;
  email: string;
  role: "admin" | "participant";
  age: string;
  phone: string;
  school: string;
  password?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "participant",
    age: "",
    phone: "",
    school: "",
    password: ""
  });

  // Carregar usuários ao iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Usa a função correta do userAPI
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível buscar a lista de usuários."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "participant",
      age: "",
      phone: "",
      school: "",
      password: ""
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age?.toString() || "",
      phone: user.phone || "",
      school: user.school || "",
      password: ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };

      if (editingUser) {
        // Editar
        if (!payload.password) delete payload.password;
        
        const response = await api.put(`/users/${editingUser.id}`, payload);
        
        setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
        toast({ title: "Usuário atualizado!", description: "Os dados foram salvos com sucesso." });
      } else {
        // Criar
        if (!payload.password) {
          toast({ variant: "destructive", title: "Erro", description: "Senha é obrigatória para novos usuários." });
          setIsSaving(false);
          return;
        }
        const response = await api.post("/users", payload);
        setUsers([...users, response.data]);
        toast({ title: "Usuário criado!", description: "Novo usuário cadastrado." });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Verifique os dados e tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast({ title: "Usuário excluído", description: "O registro foi removido." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível remover o usuário."
      });
    }
  };

  const handleExportUsers = () => {
    // 1. Prepara os dados
    const data = filteredUsers.map(u => ({
      Nome: u.name,
      Email: u.email,
      Tipo: u.role === "admin" ? "Administrador" : "Usuário",
      Telefone: u.phone || ""
    }));

    // 2. Cria a Planilha (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Define a LARGURA das colunas (Aqui está a mágica!)
    // wch = width chars (largura em caracteres)
    worksheet['!cols'] = [
      { wch: 30 }, // Coluna A (Nome) - 30 caracteres
      { wch: 35 }, // Coluna B (Email) - 35 caracteres
      { wch: 15 }, // Coluna C (Tipo) - 15 caracteres
      { wch: 20 }  // Coluna D (Telefone) - 20 caracteres
    ];

    // 4. Cria o Arquivo (Workbook) e adiciona a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários");

    // 5. Baixa o arquivo .xlsx
    XLSX.writeFile(workbook, `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({ title: "Exportação concluída!", description: "Arquivo Excel (.xlsx) gerado." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-meninas bg-clip-text text-transparent mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Usuários Cadastrados</CardTitle>
                <CardDescription>
                  {isLoading ? "Carregando..." : `Total: ${filteredUsers.length} usuário(s)`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportUsers} variant="outline" disabled={isLoading}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreateUser}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                      <DialogDescription>
                        {editingUser ? "Atualize os dados do usuário" : "Cadastre um novo usuário no sistema"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">
                              {editingUser ? "Nova Senha (opcional)" : "Senha *"}
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder={editingUser ? "Deixe em branco para manter" : "Senha segura"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              required={!editingUser}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Tipo de Acesso *</Label>
                          <Select 
                            value={formData.role} 
                            onValueChange={(value: "admin" | "participant") => setFormData({ ...formData, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="participant">Usuário</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="phone">Telefone</Label>
                           <Input
                             id="phone"
                             type="tel"
                             value={formData.phone}
                             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                           />
                        </div>
                         
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          {editingUser ? "Salvar Alterações" : "Cadastrar Usuário"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="participant">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo de Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> Carregando usuários...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Administrador" : "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === "admin"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserManagement;