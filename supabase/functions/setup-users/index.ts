import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    type UserSpec = {
      email: string;
      password: string;
      full_name: string;
      role: string;
      phone?: string;
      fixed_id?: string;
    };

    const users: UserSpec[] = [
      {
        email: "admin@sobujbazar.com",
        password: "admin123456",
        full_name: "অ্যাডমিন",
        role: "admin",
        phone: "+91 9000000001",
        fixed_id: "00000000-0000-0000-0000-000000000002",
      },
      {
        email: "demo@sobujbazar.com",
        password: "demo123456",
        full_name: "ডেমো বিক্রেতা",
        role: "vendor",
        phone: "+91 9000000000",
        fixed_id: "00000000-0000-0000-0000-000000000001",
      },
    ];

    const results: Array<Record<string, unknown>> = [];

    for (const user of users) {
      // Check if user already exists
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find((u: { email?: string }) => u.email === user.email);

      if (found) {
        // Delete existing user so we can recreate with correct state
        await supabase.auth.admin.deleteUser(found.id);
      }

      // Create user with the Auth Admin API
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      });

      if (createErr) {
        results.push({ email: user.email, error: createErr.message });
        continue;
      }

      const newUserId = created.user?.id;

      // Update profile with role and phone
      if (newUserId) {
        // Delete the auto-created profile (if trigger created one), then insert correct one
        await supabase.from("profiles").delete().eq("id", newUserId);

        const { error: profileErr } = await supabase.from("profiles").insert({
          id: newUserId,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone || null,
        });

        if (profileErr) {
          results.push({ email: user.email, user_id: newUserId, profile_error: profileErr.message });
        } else {
          results.push({ email: user.email, user_id: newUserId, status: "created", profile: "ok" });
        }
      } else {
        results.push({ email: user.email, error: "No user id returned" });
      }
    }

    // Now re-link products to the new demo vendor user
    const { data: demoUser } = await supabase.auth.admin.listUsers();
    const newDemo = demoUser?.users?.find((u: { email?: string }) => u.email === "demo@sobujbazar.com");

    if (newDemo) {
      // Update all products that had the old vendor_id to the new user id
      const { error: updateErr } = await supabase
        .from("products")
        .update({ vendor_id: newDemo.id })
        .eq("vendor_id", "00000000-0000-0000-0000-000000000001");

      if (updateErr) {
        results.push({ products_update: updateErr.message });
      } else {
        results.push({ products_update: "ok", new_vendor_id: newDemo.id });
      }
    }

    return new Response(JSON.stringify({ results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
