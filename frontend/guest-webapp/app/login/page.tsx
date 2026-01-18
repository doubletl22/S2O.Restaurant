"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { setAccessToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-md p-4">
      <Card className="p-4">
        <div className="text-sm text-[color:var(--muted)]">Internal</div>
        <div className="text-lg font-bold">Login (optional)</div>

        <div className="mt-3 space-y-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            type="password"
          />

          <Button
            onClick={() => {
              // NOTE: Guest app normally doesn't do auth.
              // This is only to avoid missing page/errors in build.
              setAccessToken("demo-token");
              setMsg("Đã set token demo. Guest app thực tế không cần login.");
            }}
          >
            Đăng nhập (demo)
          </Button>

          {msg ? <div className="text-sm text-[color:var(--muted)]">{msg}</div> : null}
        </div>
      </Card>
    </main>
  );
}
