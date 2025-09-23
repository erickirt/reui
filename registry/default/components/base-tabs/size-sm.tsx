import { Tabs, TabsList, TabsTrigger } from '@/registry/default/ui/base-tabs';
import { Bell, ShieldCheck, UserRound } from 'lucide-react';

export default function TabsDemo() {
  return (
    <div className="flex flex-col items-center gap-8">
      <Tabs defaultValue="profile" className="text-sm text-muted-foreground">
        <TabsList size="sm">
          <TabsTrigger value="profile">
            <UserRound /> Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell /> Notifications
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs defaultValue="profile" className="text-sm text-muted-foreground">
        <TabsList size="sm" variant="button">
          <TabsTrigger value="profile">
            <UserRound /> Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell /> Notifications
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs defaultValue="profile" className="text-sm text-muted-foreground">
        <TabsList size="sm" variant="line">
          <TabsTrigger value="profile">
            <UserRound /> Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell /> Notifications
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
