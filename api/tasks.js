```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const title = req.body?.title?.trim();

      if (!title) {
        return res.status(400).json({
          error: "Task title is required"
        });
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({ title, completed: false })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    }

    return res.status(405).json({
      error: "Method not allowed"
    });
  } catch (error) {
    console.error("Tasks API error:", error);

    return res.status(500).json({
      error: error.message || "Unknown server error",
      code: error.code || null,
      hint: error.hint || null,
      details: error.details || null
    });
  }
}
```