
const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");

const app = express();
const DB_FILE = "./db.json";

app.use(cors());
app.use(express.json());

async function readTasks() {
  try {
    const data = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ tasks: [] }, null, 2));
    return { tasks: [] };
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(DB_FILE, JSON.stringify({ tasks }, null, 2));
}

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running!" });
});

app.get("/api/tasks", async (req, res) => {
  const db = await readTasks();
  res.json(db.tasks);
});

app.post("/api/tasks", async (req, res) => {
  const title = req.body.title?.trim();

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const db = await readTasks();
  const task = {
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  db.tasks.push(task);
  await saveTasks(db.tasks);
  res.status(201).json(task);
});

app.put("/api/tasks/:id", async (req, res) => {
  const db = await readTasks();
  const task = db.tasks.find((t) => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (typeof req.body.title === "string" && req.body.title.trim()) {
    task.title = req.body.title.trim();
  }

  if (typeof req.body.completed === "boolean") {
    task.completed = req.body.completed;
  }

  await saveTasks(db.tasks);
  res.json(task);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const db = await readTasks();
  const tasks = db.tasks.filter((t) => t.id !== req.params.id);

  if (tasks.length === db.tasks.length) {
    return res.status(404).json({ error: "Task not found" });
  }

  await saveTasks(tasks);
  res.json({ message: "Task deleted successfully" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
