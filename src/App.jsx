
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/tasks";
const QUOTE_API = "https://dummyjson.com/quotes/random";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Failed to load tasks");

      const data = await response.json();
      setTasks(data);
      setError("");
    } catch {
      setError("Backend connection failed. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuote() {
    setQuoteLoading(true);
    setQuoteError("");

    try {
      const response = await fetch(QUOTE_API);
      if (!response.ok) throw new Error("Failed to fetch quote");

      const data = await response.json();
      setQuote(data);
    } catch {
      setQuoteError("Could not load a quote. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    loadQuote();
  }, []);

  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const newTask = await response.json();
      setTasks((previous) => [...previous, newTask]);
      setTitle("");
      setError("");
    } catch {
      setError("Could not add task. Please try again.");
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();

      setTasks((previous) =>
        previous.map((task) => (task.id === id ? updatedTask : task))
      );

      cancelEditing();
      setError("");
    } catch {
      setError("Could not update task. Please try again.");
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();

      setTasks((previous) =>
        previous.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );

      setError("");
    } catch {
      setError("Could not update task status.");
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((previous) => previous.filter((task) => task.id !== id));

      if (editingId === id) cancelEditing();

      setError("");
    } catch {
      setError("Could not delete task. Please try again.");
    }
  }

  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <main className="app">
      <header className="app-header">
        <div className="app-icon">✓</div>
        <span className="eyebrow">STAY ORGANIZED</span>
        <h1>Task Manager</h1>
        <p>Plan your day. Get things done.</p>
      </header>

      <section className="quote-card">
        <span className="eyebrow">DAILY INSPIRATION</span>

        {quoteLoading && !quote ? (
          <p className="quote-placeholder">Loading inspiration...</p>
        ) : quote ? (
          <>
            <blockquote>“{quote.quote}”</blockquote>
            <p className="quote-author">— {quote.author}</p>
          </>
        ) : (
          <p className="quote-placeholder">
            Get a little inspiration for your day.
          </p>
        )}

        {quoteError && (
          <p className="quote-error" role="alert">
            {quoteError}
          </p>
        )}

        <button
          type="button"
          className="quote-button"
          onClick={loadQuote}
          disabled={quoteLoading}
        >
          {quoteLoading ? "Loading..." : "Get Inspiration"}
        </button>
      </section>

      <section className="task-summary">
        <div>
          <span className="summary-number">{tasks.length}</span>
          <span className="summary-label">Total tasks</span>
        </div>
        <div>
          <span className="summary-number">{remaining}</span>
          <span className="summary-label">Remaining</span>
        </div>
        <div>
          <span className="summary-number">{completed}</span>
          <span className="summary-label">Completed</span>
        </div>
      </section>

      <form className="add-form" onSubmit={addTask}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to get done?"
          aria-label="New task title"
        />
        <button type="submit" className="add-button">
          + Add Task
        </button>
      </form>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <section className="tasks-section">
        <div className="section-heading">
          <h2>Your tasks</h2>
          <span className="task-count">{tasks.length} tasks</span>
        </div>

        {loading ? (
          <p className="empty-message">Loading your tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">☑</div>
            <h3>No tasks yet</h3>
            <p>Add your first task above to get started.</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article
                className={`task ${task.completed ? "task-done" : ""}`}
                key={task.id}
              >
                {editingId === task.id ? (
                  <div className="edit-row">
                    <input
                      autoFocus
                      className="edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(task.id);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      aria-label="Edit task title"
                    />
                    <button
                      type="button"
                      className="save-button"
                      onClick={() => saveEdit(task.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        aria-label={`Mark ${task.title} completed`}
                      />
                      <span className="task-title">{task.title}</span>
                    </label>

                    <div className="task-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => startEditing(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span>Task Manager</span>
        <span>Built with React &amp; Express</span>
      </footer>
    </main>
  );
}

export default App;
