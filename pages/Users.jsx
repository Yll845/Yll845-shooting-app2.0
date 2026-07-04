import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Mail, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import InviteUserDialog from '@/components/users/InviteUserDialog';

const roleColors = {
  super_admin: 'bg-red-100 text-red-800',
  admin: 'bg-blue-100 text-blue-800',
  competition_admin: 'bg-purple-100 text-purple-800',
  club_user: 'bg-green-100 text-green-800',
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  competition_admin: 'Administrator i Garës',
  club_user: 'Club User',
};

export default function UsersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      return await base44.auth.me();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await base44.entities.User.list();
      } catch {
        return [];
      }
    },
  });

  // Shfaq butonin e ftesës vetëm për Super Admin ose Admin
  const canInvite = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  // Admin mund ta ndryshe vetëm rolin e tij në super_admin (nëse nuk ka super_admin)
  const hasSuperAdmin = users.some(u => u.role === 'super_admin');
  const canChangeRole = (userId, newRole) => {
    if (currentUser?.role === 'super_admin') return true;
    if (currentUser?.role === 'admin' && currentUser?.id === userId && newRole === 'super_admin' && !hasSuperAdmin) return true;
    return false;
  };

  const handleUpdateRole = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      await base44.functions.invoke('updateUserRole', { userId, newRole });
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['users'] }),
        queryClient.refetchQueries({ queryKey: ['current-user'] })
      ]);
    } catch (err) {
      console.error('Error updating role:', err);
      alert(`Gabim: ${err.response?.data?.error || err.message || 'Nuk mund të ndryshohet roli'}`);
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Përdoruesit"
        subtitle={`${users.length} përdorues`}
        actionLabel={canInvite ? 'Fto përdorues' : undefined}
        onAction={canInvite ? () => setInviteOpen(true) : undefined}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nuk ka përdorues"
          description={canInvite ? 'Fto përdoruesit e parë' : 'Në pritje të ftesës'}
          actionLabel={canInvite ? 'Fto përdorues' : undefined}
          onAction={canInvite ? () => setInviteOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4">
          {users.map(user => (
            <Card key={user.id} className="p-4 border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" /> {user.email}
                    </p>
                  </div>
                </div>
                {canChangeRole(user.id, 'super_admin') ? (
                  <Select value={user.role} onValueChange={(newRole) => handleUpdateRole(user.id, newRole)} disabled={updatingRole === user.id}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      {currentUser?.role === 'super_admin' && (
                        <>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="competition_admin">Administrator i Garës</SelectItem>
                          <SelectItem value="club_user">Club User</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`text-[10px] shrink-0 ${roleColors[user.role] || 'bg-gray-100'}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {roleLabels[user.role] || user.role}
                  </Badge>
                )}
                {updatingRole === user.id && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </Card>
          ))}
        </div>
      )}

      {canInvite && (
        <InviteUserDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          currentUserRole={currentUser?.role}
        />
      )}
    </div>
  );
}