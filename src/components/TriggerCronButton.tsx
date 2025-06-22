"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

export function TriggerCronButton() {
  async function triggerCron() {
    await fetch("/api/cron", { method: "GET" });
    // Optionally, you can refresh data here
  }

  return (
    <Button onClick={triggerCron} className="mb-4 mt-8" variant={"outline"}>
      Trigger Cron Job
    </Button>
  );
}
