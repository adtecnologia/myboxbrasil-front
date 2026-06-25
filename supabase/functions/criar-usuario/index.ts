import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AppRole =
  | "admin"
  | "locador"
  | "locatario"
  | "motorista"
  | "prefeitura"
  | "destino";

const VALID_ROLES: AppRole[] = [
  "admin",
  "locador",
  "locatario",
  "motorista",
  "prefeitura",
  "destino",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const body = await req.json();
    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const documento = String(body.documento ?? "").replace(/\D/g, "");
    const tipo_documento = body.tipo_documento === "cnpj" ? "cnpj" : "cpf";
    const role = String(body.role ?? "") as AppRole;
    const locador_id = body.locador_id ? String(body.locador_id) : callerId;

    if (!nome || !email || !documento || !VALID_ROLES.includes(role)) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Senha temporária aleatória
    const tempPassword = crypto.randomUUID() + "Aa1!";

    const { data: created, error: createErr } = await admin.auth.admin
      .createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nome,
          documento,
          tipo_documento,
          email_contato: email,
        },
      });

    if (createErr || !created.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message ?? "Erro ao criar" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const newUserId = created.user.id;

    // Garante o profile (caso o trigger handle_new_user não tenha rodado)
    await admin.from("profiles").upsert(
      {
        id: newUserId,
        nome,
        documento,
        tipo_documento,
        email,
      },
      { onConflict: "id" },
    );

    // Vincula a role ao tenant (locador)
    const { error: roleErr } = await admin.from("user_roles").insert({
      user_id: newUserId,
      role,
      locador_id,
      ativo: true,
    });

    if (roleErr) {
      return new Response(JSON.stringify({ error: roleErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Envia link para definir senha
    await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    return new Response(
      JSON.stringify({ ok: true, user_id: newUserId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});