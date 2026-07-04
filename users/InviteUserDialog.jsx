import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function InviteUserDialog({ open, onOpenChange, currentUserRole }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Super Admin mund të ftojë Admin, Competition Admin ose Club_User
  // Admin mund të ftojë Competition Admin ose Club_User
  const availableRoles = currentUserRole === 'super_admin' 
    ? ['admin', 'competition_admin', 'club_user']
    : currentUserRole === 'admin'
    ? ['competition_admin', 'club_user']
    : ['club_user'];

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    competition_admin: 'Administrator i Garës',
    club_user: 'Club User'
  };

  const handleInvite = async () => {
    setError('');
    setSuccess('');

    if (!email || !role) {
      setError('Plotëso emailin dhe rolin');
      return;
    }

    setSending(true);
    await base44.users.inviteUser(email, role);
    setSending(false);
    setSuccess(`${email} u ftua si ${roleLabels[role]}`);
    setEmail('');
    setRole('');

    setTimeout(() => {
      setSuccess('');
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Fto përdorues të ri</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email adresa *</Label>
            <Input
              type="email"
              placeholder="perdoruesi@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>

          <div>
            <Label>Roli *</Label>
            <Select value={role} onValueChange={setRole} disabled={sending}>
              <SelectTrigger><SelectValue placeholder="Zgjidh rolin" /></SelectTrigger>
              <SelectContent>
                {availableRoles.map(r => (
                  <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {currentUserRole === 'super_admin' 
                ? 'Si Super Admin, mund të ftosh Admin, Administrator i Garës ose Club_User'
                : currentUserRole === 'admin'
                ? 'Si Admin, mund të ftosh Administrator i Garës ose Club_User'
                : 'Si Club_User, nuk mund të ftosh përdorues'}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-green-700 font-medium">{success}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
              Anulo
            </Button>
            <Button onClick={handleInvite} disabled={sending || !email || !role}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {sending ? 'Duke dërguar...' : 'Dërgo ftesën'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}