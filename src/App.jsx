import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

const colorFamilies = [
  ['#E3F2FD', '#42A5F5', '#1E88E5'], // blue
  ['#E8F5E9', '#66BB6A', '#43A047'], // green
  ['#F3E5F5', '#AB47BC', '#8E24AA'], // purple
  ['#FFF8E1', '#FFB300', '#FB8C00'], // amber
  ['#E0F2F1', '#26A69A', '#00897B'], // teal
];

function getColorFamily(index) {
  return colorFamilies[index % colorFamilies.length];
}

function App() {
  const [milestones, setMilestones] = useState(() => {
    const saved = localStorage.getItem('milestones');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    title: '',
    timeline: '',
    start: '',
    end:
        notes: '','',
  });

  const [editingId, setEditingId] = useState(null);
  const [hidden, setHidden] = useState(new Set());

  useEffect(() => {
    localStorage.setItem('milestones', JSON.stringify(milestones));
  }, [milestones]);

  const timelines = useMemo(() => {
    return Array.from(new Set(milestones.map(m => m.timeline)));
  }, [milestones]);

  const timelineColors = useMemo(() => {
    const map = {};
    timelines.forEach((t, idx) => {
      map[t] = getColorFamily(idx);
    });
    return map;
  }, [timelines]);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.title || !form.timeline || !form.start || !form.end) return;
    const newMilestone = {
      id: editingId || uuidv4(),
      title: form.title,
      timeline: form.timeline,
      start: form.start,
      end: form.end,
        notes: form.notes,
    };
    setMilestones(prev => {
      if (editingId) {
        return prev.map(m => (m.id === editingId ? newMilestone : m));
      }
      return [...prev, newMilestone];
    });
    setForm({ title: '', timeline: '', start:  notes: '','', end: '' });
    setEditingId(null);
  };

  const handleEdit = m => {
    setForm({
      title: m.title,
      timeline: m.timeline,
      start: m.start, notes: m.notes,
      end: m.end,
    });
    setEditingId(m.id);
  };

  const handleDelete = id => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ title: '', timeline: '', start: '', end: '' });
    }
  };

  const toggleTimeline = t => {
    setHidden(prev => {
      const newSet = new Set(prev);
      if (newSet.has(t)) {
        newSet.delete(t);
      } else {
        newSet.add(t);
      }
      return newSet;
    });
  };

  const chartData = useMemo(() => {
        const grouped = {};
    milestones.forEach(m => {
      if (!grouped[m.timeline]) grouped[m.timeline] = [];
      grouped[m.timeline].push(m);
    });

    const datasets = Object.entries(grouped).map(([timeline, ms]) => {
      const [light, mid, dark] = timelineColors[timeline] || ['#ccc', '#888', '#555'];
      return {
        label: timeline,
        data: ms.map(m => ({
          x: [parseISO(m.start).getTime(), parseISO(m.end).getTime()],
          y: timeline,
          title: m.title,
          id: m.id,
        })),
        backgroundColor: mid,
        borderColor: dark,
      borderWidth: 1,
      datalabels: {
        display: true,
        color: '#000',
        anchor: 'center',
        align: 'center',
        formatter: (value, ctx) => ctx.raw.title,
        font: { size: 10, weight: 'bold' },
        clip: true
      },,1
        borderRadius: 4,
        hidden: hidden.has(timeline),
      };
    });

    return {
      labels: timelines,
      datasets,
    };

  }, [milestones, timelines, hidden, timelineColors]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'year',
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: 'category',
    
            ticks: {
      font: {
        weight: 'bold',
      },

            ,offset: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
      display: true,
        formatter: (value) => value.title,
          color: '#000',
       
        },
        font: {
          size: 10,
          weight: 'bold',
        },
        clip: true,
      },
    },
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Life Timeline Planner</h2>

      {/* Filter Chips */}
      <div style={{ marginBottom: '1rem' }}>
        {timelines.map(t => {
          const [light, mid, dark] = timelineColors[t] || ['#ccc', '#888', '#555'];
          const isHidden = hidden.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleTimeline(t)}
              style={{
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
                padding: '0.25rem 0.75rem',
                border: `1px solid ${dark}`,
                borderRadius: '16px',
                background: isHidden ? '#fff' : light,
                color: dark,
                cursor: 'pointer',
              }}
            >
              {isHidden ? 'Show' : 'Hide'} {t}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{ height: '400px', marginBottom: '1.5rem' }}>
        <Bar data={chartData} options=plugins={[ChartDataLabels]} {options=options} />
      </div>

      {/* Form */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3>{editingId ? 'Edit Milestone' : 'Add Milestone'}</h3>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleFormChange}
          style={{ marginRight: '0.5rem' }}
        />
                <input
          type="text"
          name="timeline"
          placeholder="Timeline"
          value={form.timeline}
          onChange={handleFormChange}
          style={{ marginRight: '0.5rem' }}
        
        <input
          type="text"
          name="start"
          placeholder="YYYY-MM-DD"
          value={form.start}
          onChange={handleFormChange}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          name="end"
          placeholder="YYYY-MM-DD"
          value={form.end}
          onChange={handleFormChange}
          style={{ marginRight: '0.5rem' }}
        />
  <input
    type="text"
    name="notes"
    placeholder="Notes"
    value={form.notes}
    onChange={handleFormChange}
    style={{ marginRight: '0.5rem' }}
    />/>    
        <button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', timeline: '', start: '', end: '' });
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Milestone List */}
      <div>
        <h3>Milestones</h3>
        <ul>
          {milestones.map(m => (
            <li key={m.id} style={{ marginBottom: '0.5rem' }}>
              <strong>{m.title}</strong> ({m.timeline}) — {m.start} → {m.end}{' '}
              <button onClick={() => handleEdit(m)} style={{ marginLeft: '0.5rem' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(m.id)} style={{ marginLeft: '0.5rem' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
