"use client";

import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
export default function DashboardPage() {
  const { signOut } = useClerk();
  // signOut()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <Button type="submit" onClick={() => signOut()}>
        Log Out
      </Button>
    </div>
  );
}
