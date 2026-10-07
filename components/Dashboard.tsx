"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type Task = { id: string; title: string; description: string | null; completed: boolean; dueDate: string | null; priority: Priority; createdAt: string; updatedAt: string };
type List = { id: string; name: string; tasks: Task[]; updatedAt: string };

async function api(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "content-type": "application/json", ...(options?.headers || {}) } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "A művelet nem sikerült.");
  return result;
}

function priorityLabel(priority: Priority) {
  return ({ LOW: "Alacsony", MEDIUM: "Közepes", HIGH: "Magas" } as const)[priority];
}

export function Dashboard({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sort, setSort] = useState<"created" | "due" | "priority">("created");
  const [editing, setEditing] = useState<Task | null>(null);

  async function load() {
    try {
      const result = await api("/api/lists");
      setLists(result.lists);
      setActiveId((current) => current && result.lists.some((item: List) => item.id === current) ? current : result.lists[0]?.id || null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Betöltési hiba."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const activeList = lists.find((list) => list.id === activeId) || null;
  const tasks = useMemo(() => {
    const visible = (activeList?.tasks || []).filter((task) => filter === "all" || (filter === "completed" ? task.completed : !task.completed));
    return [...visible].sort((a, b) => {
      if (sort === "priority") return ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[a.priority] - { HIGH: 0, MEDIUM: 1, LOW: 2 }[b.priority]);
      if (sort === "due") return (a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER) - (b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeList, filter, sort]);

  async function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = event.currentTarget; const name = String(new FormData(form).get("name"));
    try { const result = await api("/api/lists", { method: "POST", body: JSON.stringify({ name }) }); setLists((value) => [result.list, ...value]); setActiveId(result.list.id); form.reset(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hiba."); }
  }

  async function renameList(list: List) {
    const name = window.prompt("A lista új neve:", list.name)?.trim();
    if (!name || name === list.name) return;
    try { const result = await api(`/api/lists/${list.id}`, { method: "PATCH", body: JSON.stringify({ name }) }); setLists((value) => value.map((item) => item.id === list.id ? { ...item, name: result.list.name } : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hiba."); }
  }

  async function deleteList(list: List) {
    if (!window.confirm(`Biztosan törli ezt a listát és minden feladatát?\n${list.name}`)) return;
    try { await api(`/api/lists/${list.id}`, { method: "DELETE" }); const next = lists.filter((item) => item.id !== list.id); setLists(next); setActiveId(next[0]?.id || null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hiba."); }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!activeList) return; setError("");
    const form = event.currentTarget; const values = new FormData(form); const due = String(values.get("dueDate") || "");
    try {
      const result = await api("/api/tasks", { method: "POST", body: JSON.stringify({ listId: activeList.id, title: values.get("title"), description: values.get("description") || null, dueDate: due ? new Date(due).toISOString() : null, priority: values.get("priority") }) });
      setLists((all) => all.map((list) => list.id === activeList.id ? { ...list, tasks: [result.task, ...list.tasks] } : list)); form.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Hiba."); }
  }

  async function updateTask(id: string, changes: Partial<Task>) {
    try { const result = await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) }); setLists((all) => all.map((list) => ({ ...list, tasks: list.tasks.map((task) => task.id === id ? result.task : task) }))); setEditing(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hiba."); }
  }

  async function deleteTask(id: string) {
    if (!window.confirm("Biztosan törli ezt a feladatot?")) return;
    try { await api(`/api/tasks/${id}`, { method: "DELETE" }); setLists((all) => all.map((list) => ({ ...list, tasks: list.tasks.filter((task) => task.id !== id) }))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hiba."); }
  }

  async function logout() { await api("/api/auth/logout", { method: "POST", body: "{}" }); router.push("/login"); router.refresh(); }

  return (
    <section className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div><span className="eyebrow light">Munkaterület</span><h1>Feladatlisták</h1></div>
        <form className="new-list" onSubmit={createList}><input name="name" placeholder="Új lista neve" maxLength={120} required /><button aria-label="Lista hozzáadása">+</button></form>
        <div className="list-nav">
          {lists.map((list) => <div className={`list-nav-row ${list.id === activeId ? "active" : ""}`} key={list.id}><button className="list-select" onClick={() => setActiveId(list.id)}><span>{list.name}</span><small>{list.tasks.filter((task) => !task.completed).length}</small></button><button className="icon-button" onClick={() => renameList(list)} title="Átnevezés">✎</button><button className="icon-button danger" onClick={() => deleteList(list)} title="Törlés">×</button></div>)}
          {!lists.length && !loading && <p className="sidebar-empty">Hozza létre az első listáját.</p>}
        </div>
        <div className="user-card"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.email}</small></div><button className="icon-button" onClick={logout} title="Kijelentkezés">↪</button></div>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-top"><div><span className="eyebrow">Személyes munkaterület</span><h2>{activeList?.name || "Feladataim"}</h2></div><div className="task-summary"><b>{activeList?.tasks.filter((task) => task.completed).length || 0}</b><span>teljesített</span></div></div>
        {error && <p className="alert error">{error}<button onClick={() => setError("")}>×</button></p>}
        {loading ? <div className="empty-state">Adatok betöltése…</div> : activeList ? <>
          <form className="task-create" onSubmit={createTask}>
            <input className="task-title-input" name="title" placeholder="Mit szeretne elvégezni?" maxLength={240} required />
            <input name="description" placeholder="Rövid leírás (opcionális)" maxLength={2000} />
            <input name="dueDate" type="datetime-local" aria-label="Határidő" />
            <select name="priority" defaultValue="MEDIUM" aria-label="Prioritás"><option value="LOW">Alacsony</option><option value="MEDIUM">Közepes</option><option value="HIGH">Magas</option></select>
            <button className="button">Hozzáadás</button>
          </form>
          <div className="task-toolbar"><div className="segmented"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Mind</button><button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Aktív</button><button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Kész</button></div><label>Rendezés <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="created">Létrehozás</option><option value="due">Határidő</option><option value="priority">Prioritás</option></select></label></div>
          <div className="tasks">
            {tasks.map((task) => <article className={`task-card ${task.completed ? "completed" : ""}`} key={task.id}><button className="task-check" aria-label={task.completed ? "Újra aktív" : "Teljesített"} onClick={() => updateTask(task.id, { completed: !task.completed })}>{task.completed ? "✓" : ""}</button><div className="task-copy"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<div className="task-meta"><span className={`priority ${task.priority.toLowerCase()}`}>{priorityLabel(task.priority)}</span>{task.dueDate && <span>Határidő: {new Intl.DateTimeFormat("hu-HU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(task.dueDate))}</span>}</div></div><div className="task-actions"><button className="icon-button" onClick={() => setEditing(task)}>✎</button><button className="icon-button danger" onClick={() => deleteTask(task.id)}>×</button></div></article>)}
            {!tasks.length && <div className="empty-state"><strong>Nincs megjeleníthető feladat.</strong><span>Adjon hozzá egy új feladatot a fenti űrlapon.</span></div>}
          </div>
        </> : <div className="empty-state"><strong>Még nincs feladatlistája.</strong><span>Az oldalsávban hozhatja létre az elsőt.</span></div>}
      </div>
      {editing && <EditTask task={editing} onClose={() => setEditing(null)} onSave={updateTask} />}
    </section>
  );
}

function EditTask({ task, onClose, onSave }: { task: Task; onClose: () => void; onSave: (id: string, changes: Partial<Task>) => Promise<void> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values = new FormData(event.currentTarget); const due = String(values.get("dueDate") || "");
    await onSave(task.id, { title: String(values.get("title")), description: String(values.get("description") || ""), priority: String(values.get("priority")) as Priority, dueDate: due ? new Date(due).toISOString() : null });
  }
  const localDue = task.dueDate ? new Date(new Date(task.dueDate).getTime() - new Date(task.dueDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal" onSubmit={submit}><div className="modal-head"><h2>Feladat szerkesztése</h2><button type="button" className="icon-button" onClick={onClose}>×</button></div><label>Feladat neve<input name="title" defaultValue={task.title} maxLength={240} required /></label><label>Leírás<textarea name="description" defaultValue={task.description || ""} maxLength={2000} rows={4} /></label><div className="form-row"><label>Határidő<input name="dueDate" type="datetime-local" defaultValue={localDue} /></label><label>Prioritás<select name="priority" defaultValue={task.priority}><option value="LOW">Alacsony</option><option value="MEDIUM">Közepes</option><option value="HIGH">Magas</option></select></label></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Mégse</button><button className="button">Mentés</button></div></form></div>;
}
