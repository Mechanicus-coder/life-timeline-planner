import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import { v4 as uuidv4 } from 'uuid';

Chart.register(BarElement, CategoryScale, LinearScale, TimeScale, Tooltip, Legend, annotationPlugin);

const STORAGE_KEY = 'life-timeline-milestones';

function parseDate(value) {
  // Accept YYYY-MM-DD or MM/DD/YYYY
  if (!value) return null;
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const usMatch = /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  if (isoMatch) return new Date(value);
  if (usMatch) {
    const [m, d, y] = value.split('/');
    return new Date(`${y}-${m}-${d}`);
  }
  return null;
}

function App() {
  const [milestones, setMilestones] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    timeline: 'Career',
    title: '',
    start: '',
    end: ''
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
  }, [milestones]);

  const timelines = Array.from(new Set(milestones.map((m) => m.timeline)));

  const colors = ['#ff6384', '#36a2eb', '#4bc0c0', '#9966ff', '#ff9f40'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Basic validation
    const startDate = parseDate(form.start);
    const endDate = parseDate(form.end);
    if (!form.title || !startDate || !endDate) return;

    if (editingId) {
      // Update existing
      setMilestones(
        milestones.map((m) =>
          m.id === editingId ? { ...m, ...form } : m
        )
      );
      setEditingId(null);
    } else {
      // Add new
      setMilestones([...milestones, { id: uuidv4(), ...form }]);
    }

    setForm({ ...form, title: '', start: '', end: '' });
  };

  const deleteMilestone = (id) => {
    setMilestones(milestones.filter((m) => m.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const editMilestone = (m) => {
    setForm({ timeline: m.timeline, title: m.title, start: m.start, end: m.end });
    setEditingId(m.id);
  };

  const datasets = timelines.map((tl, idx) => ({
    label: tl,
    data: milestones
      .filter((m) => m.timeline === tl)
      .map((m) => ({ x: [new Date(m.start).getTime(), new Date(m.end).getTime()], y: tl, id: m.id })),
    backgroundColor: colors[idx % colors.length],
    borderWidth: 1,
    borderColor: '#333'
  }));

  const chartData = { datasets };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        type: 'time',
        position: 'top',
        time: { unit: 'year' },
        title: { display: true, text: 'Date' }
      },
      y: {
        type: 'category',
        labels: timelines,
        title: { display: true, text: 'Timelines' }
      }
    },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const { raw } = ctx;
            const start = new Date(raw.x[0]).toLocaleDateString();
            const end = new Date(raw.x[1]).toLocaleDateString();
            return `${ctx.dataset.label}: ${start} - ${end}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Life Timeline Planner</h1>

      <div style={{ marginBottom: '1rem' }}>
        <h3>{editingId ? 'Edit Milestone' : 'Add Milestone'}</h3>
        <input
          name="timeline"
          value={form.timeline}
          onChange={handleChange}
          placeholder="Timeline (e.g., Career)"
          style={{ marginRight: '0.5rem' }}
        />
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Milestone Title"
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          name="start"
          value={form.start}
          onChange={handleChange}
          placeholder="Start (YYYY-MM-DD)"
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          name="end"
          value={form.end}
          onChange={handleChange}
          placeholder="End (YYYY-MM-DD)"
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button onClick={() => { setForm({ timeline: 'Career', title: '', start: '', end: '' }); setEditingId(null); }} style={{ marginLeft: '0.5rem' }}>
            Cancel
          </button>
        )}
      </div>

      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>

      <h3>Milestone List</h3>
      <ul>
        {milestones.map((m) => (
          <li key={m.id}>
            <strong>{m.timeline}</strong> – {m.title} ({m.start} → {m.end})
            <button onClick={() => editMilestone(m)} style={{ marginLeft: '0.5rem' }}>
              Edit
            </button>
            <button onClick={() => deleteMilestone(m.id)} style={{ marginLeft: '0.5rem' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
