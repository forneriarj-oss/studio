'use client';
import { useState } from 'react';
import { getUsers, getRoles, getRoleById } from '@/lib/data';
import type { User, Role } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(getUsers());
  const roles = getRoles();
  const { toast } = useToast();

  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role['id'] | ''>('');

  const handleAddUser = () => {
    if (!newUserEmail || !newUserRole) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, preencha o e-mail e a função.',
      });
      return;
    }
    const newUser: User = {
      id: newUserEmail,
      email: newUserEmail,
      roleId: newUserRole as Role['id'],
    };
    setUsers(prev => [...prev, newUser]);
    toast({
      title: 'Usuário Adicionado!',
      description: `O usuário ${newUserEmail} foi adicionado com sucesso.`,
    });
    setNewUserEmail('');
    setNewUserRole('');
    setIsNewUserDialogOpen(false);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: 'Usuário Removido',
      description: 'O usuário foi removido com sucesso.',
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Usuários e Permissões</h1>
         <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Convide um novo membro para a equipe e defina sua função.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail do Usuário</Label>
                    <Input id="email" type="email" placeholder="ex: colega@suaempresa.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select value={newUserRole} onValueChange={value => setNewUserRole(value as Role['id'])}>
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddUser}>Adicionar Usuário</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Equipe</CardTitle>
          <CardDescription>Visualize, adicione ou remova membros da sua equipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const role = getRoleById(user.roleId);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {role ? <Badge variant="secondary">{role.name}</Badge> : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: 'Em breve!', description: 'Funcionalidade de edição em desenvolvimento.'})}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Excluir</span>
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
