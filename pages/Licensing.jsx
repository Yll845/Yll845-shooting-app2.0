import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, UserCheck } from 'lucide-react';
import ClubLicensing from '@/components/licensing/ClubLicensing';
import AthleteLicensing from '@/components/licensing/AthleteLicensing';

export default function Licensing() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Licencimi</h1>
        <p className="text-muted-foreground mt-1">Menaxhimi i licencave të klubeve dhe garuesve — vetëm zyrtarët e federatës</p>
      </div>

      <Tabs defaultValue="clubs">
        <TabsList className="mb-6">
          <TabsTrigger value="clubs"><Building2 className="h-3.5 w-3.5 mr-1.5" />Licencimi i Klubeve</TabsTrigger>
          <TabsTrigger value="athletes"><UserCheck className="h-3.5 w-3.5 mr-1.5" />Licencimi i Garuesve</TabsTrigger>
        </TabsList>
        <TabsContent value="clubs"><ClubLicensing /></TabsContent>
        <TabsContent value="athletes"><AthleteLicensing /></TabsContent>
      </Tabs>
    </div>
  );
}