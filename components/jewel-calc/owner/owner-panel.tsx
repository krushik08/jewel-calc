"use client";

import { Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PricingControls } from "@/components/jewel-calc/owner/pricing-controls";
import { RateEditor } from "@/components/jewel-calc/owner/rate-editor";

export function OwnerPanel() {
  return (
    <Card className="border-primary/25 bg-gradient-to-b from-accent/50 to-card print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-4 text-primary" /> Owner Settings
        </CardTitle>
        <CardDescription>Profit & pricing controls — hidden from employees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <PricingControls />
        <Separator />
        <RateEditor />
      </CardContent>
    </Card>
  );
}
