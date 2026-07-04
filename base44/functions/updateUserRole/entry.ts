import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      return Response.json({ error: 'Missing userId or newRole' }, { status: 400 });
    }

    // Admin mund të ndryshe vetëm rolin e vetes në super_admin (nëse nuk ka super_admin)
    if (user.role === 'admin' && user.id === userId && newRole === 'super_admin') {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const hasSuperAdmin = allUsers.some(u => u.role === 'super_admin');
      
      if (!hasSuperAdmin) {
        try {
          await base44.asServiceRole.entities.User.update(userId, { role: newRole });
          return Response.json({ success: true, message: 'Elevated to Super Admin' });
        } catch (err) {
          return Response.json({ error: err.message || 'Cannot update role' }, { status: 400 });
        }
      }
    }

    // Super admin mund të ndryshojë rolet e çdo përdoruesi
    if (user.role === 'super_admin') {
      try {
        await base44.asServiceRole.entities.User.update(userId, { role: newRole });
        return Response.json({ success: true, message: `User role updated to ${newRole}` });
      } catch (err) {
        return Response.json({ error: err.message || 'Cannot update role' }, { status: 400 });
      }
    }

    return Response.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});