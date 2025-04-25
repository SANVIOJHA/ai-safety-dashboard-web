import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  reported_at: string;
  acknowledged: boolean;
  tags?: string[];
}

const initialIncidents: Incident[] = [
  {
    id: 1,
    title: "Biased Recommendation Algorithm",
    description: "Algorithm consistently favored certain demographics...",
    severity: "Medium",
    reported_at: "2025-03-15T10:00:00Z",
    acknowledged: false,
    tags: ["Bias", "Algorithm"]
  },
  {
    id: 2,
    title: "LLM Hallucination in Critical Info",
    description: "LLM provided incorrect safety procedure information...",
    severity: "High",
    reported_at: "2025-04-01T14:30:00Z",
    acknowledged: false,
    tags: ["Hallucination", "LLM"]
  },
  {
    id: 3,
    title: "Minor Data Leak via Chatbot",
    description: "Chatbot inadvertently exposed non-sensitive user metadata...",
    severity: "Low",
    reported_at: "2025-03-20T09:15:00Z",
    acknowledged: false,
    tags: ["Privacy", "Chatbot"]
  },
];

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [filter, setFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "Low",
    tags: "",
  });
  const [search, setSearch] = useState("");

  const filtered = incidents
    .filter((i) => (filter === "All" ? true : i.severity === filter))
    .filter((i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

  const sorted = filtered.sort((a, b) => {
    return sortOrder === "newest"
      ? new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
      : new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
  });

  const handleAddIncident = () => {
    if (!newIncident.title.trim() || !newIncident.description.trim()) return;
    const newEntry: Incident = {
      id: Date.now(),
      title: newIncident.title,
      description: newIncident.description,
      severity: newIncident.severity as Incident["severity"],
      reported_at: new Date().toISOString(),
      acknowledged: false,
      tags: newIncident.tags.split(",").map(tag => tag.trim()).filter(Boolean),
    };
    setIncidents([newEntry, ...incidents]);
    setNewIncident({ title: "", description: "", severity: "Low", tags: "" });
  };

  const toggleAcknowledge = (id: number) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id
          ? { ...incident, acknowledged: !incident.acknowledged }
          : incident
      )
    );
  };

  return (
    <div className="container">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        AI Safety Incident Dashboard
      </motion.h1>

      <motion.div className="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <input
          type="text"
          placeholder="Search incidents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </motion.div>

      <motion.div
        className="form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Report New Incident</h2>
        <input
          type="text"
          placeholder="Title"
          value={newIncident.title}
          onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newIncident.description}
          onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Comma-separated Tags (e.g. LLM, Privacy)"
          value={newIncident.tags}
          onChange={(e) => setNewIncident({ ...newIncident, tags: e.target.value })}
        />
        <select
          value={newIncident.severity}
          onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={handleAddIncident}>Submit</button>
      </motion.div>

      <ul className="incident-list">
        <AnimatePresence>
          {sorted.map((incident) => (
            <motion.li
              key={incident.id}
              className="incident"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              layout
            >
              <div className="summary">
                <strong>{incident.title}</strong> | {incident.severity} |{' '}
                {new Date(incident.reported_at).toLocaleDateString()}
                <button onClick={() => setExpanded(expanded === incident.id ? null : incident.id)}>
                  {expanded === incident.id ? "Hide Details" : "View Details"}
                </button>
                <button
                  className={incident.acknowledged ? "acknowledged" : "unacknowledged"}
                  onClick={() => toggleAcknowledge(incident.id)}
                >
                  {incident.acknowledged ? "Acknowledged" : "Acknowledge"}
                </button>
              </div>
              <AnimatePresence>
                {expanded === incident.id && (
                  <motion.div
                    className="description"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{incident.description}</p>
                    {incident.tags && incident.tags.length > 0 && (
                      <motion.div
                        className="tags"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {incident.tags.map((tag, idx) => (
                          <motion.span
                            className="tag"
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
