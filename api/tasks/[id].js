import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  const id = req.query.id;

  try {
    if (req.method === "PUT") {
      const updates = {};

      if (typeof req.body?.title === "string") {
        const title = req.body.title.trim();

        if (!title) {
          return res.status(400).json({ error: "Task title is required" });
        }

        updates.title = title;
      }

      if (typeof req.body?.completed === "boolean") {
        updates.completed = req.body.completed;
      }

      if (!Object.keys(updates).length) {
        return res.status(400).json({ error: "No valid updates provided" });
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      const { data, error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        message: "Task deleted successfully",
        task: data
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Task API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}