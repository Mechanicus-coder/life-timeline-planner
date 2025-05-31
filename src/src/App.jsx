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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
  }, [milestones]);

  const timelines = Array.from(new Set(milestones.map((m) => m.timeline)));

  const colors = ['#ff6384', '#36a2eb', '#4bc0c0', '#9966ff', '#ff9f40'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMilestone = () => {
    if (!form.title || !form.start || !form.end) return;
    setMilestones([...milestones, { id: uuidv4(), ...form }]);
    setForm({ ...form, title: '', start: '', end: '' });
  };

  const deleteMilestone = (id) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const datasets = timelines.map((tl, idx) => ({
    label: tl,
    data: milestones
      .filter((m) => m.timeline === tl)
      .map((m) => ({ x: [new Date(m.start).getTime(), new Date(m.end).getTime()], y: m.title, id: m.id })),
    backgroundColor: colors[idx % colors.length],
    borderWidth: 1,
    borderColor: '#333'
  }));

  const chartData = {
    datasets
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        type: 'time',
        position: 'top',
        time: {
          unit: 'year'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'category',
        title: {
          display: true,
          text: 'Milestones'
        }
      }
    },
plugins: {
   
    datalabels: {
    display: true,
    color: '#000',
    anchor: 'center',
    align: 'center',
    formatter: (value, ctx) => ctx.raw.y,
    font: { size: 10, weight: 'bold' },
    clip: true
  },
legend: {
        position: 'bottom'
      },
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
        <h3>Add Milestone</h3>
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
        <input type="date" name="start" value={form.start} onChange={handleChange} style={{ marginRight: '0.5rem' }} />
        <input type="date" name="end" value={form.end} onChange={handleChange} style={{ marginRight: '0.5rem' }} />
        <button onClick={addMilestone}>Add</button>
      </div>

      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>

      <h3>Milestone List</h3>
      <ul>
        {milestones.map((m) => (
          <li key={m.id}>
            <strong>{m.timeline}</strong> - {m.title} ({m.start} to {m.end})
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
