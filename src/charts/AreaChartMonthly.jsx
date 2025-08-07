import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useThemeProvider } from '../utils/ThemeContext';

Chart.register(...registerables);

const AreaChartMonthly = ({ data, width = 600, height = 280, onBarClick, selectedMonth }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { currentTheme } = useThemeProvider();

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext('2d');
    const darkMode = currentTheme === 'dark';

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, darkMode ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.25)');
    gradient.addColorStop(1, darkMode ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.01)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Total Presensi',
            data: data.values,
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: data.labels.map(l => selectedMonth && l === selectedMonth ? 8 : 4),
            pointBackgroundColor: data.labels.map(l => selectedMonth && l === selectedMonth ? '#f59e42' : '#3b82f6'),
            pointBorderColor: data.labels.map(l => selectedMonth && l === selectedMonth ? '#f59e42' : (darkMode ? '#1f2937' : '#fff')),
            pointBorderWidth: 2,
            pointHoverRadius: 10,
            pointHoverBorderWidth: 3,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255,255,255,0.95)',
            titleColor: darkMode ? '#f3f4f6' : '#1f2937',
            bodyColor: darkMode ? '#d1d5db' : '#4b5563',
            borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context) => `Bulan: ${context[0].label}`,
              label: (context) => `Total: ${context.parsed.y} presensi`,
            }
          }
        },
        onClick: (e, elements) => {
          if (onBarClick && elements && elements.length > 0) {
            const idx = elements[0].index;
            const label = data.labels[idx];
            onBarClick(label);
          }
        },
        scales: {
          x: {
            grid: {
              color: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)',
              drawBorder: false
            },
            ticks: {
              color: darkMode ? '#9ca3af' : '#6b7280',
              font: { size: 12 },
              maxRotation: 0
            }
          },
          y: {
            grid: {
              color: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)',
              drawBorder: false
            },
            ticks: {
              color: darkMode ? '#9ca3af' : '#6b7280',
              font: { size: 12 },
              beginAtZero: true,
              stepSize: 1
            }
          }
        }
      }
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data, currentTheme, height, onBarClick, selectedMonth]);

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default AreaChartMonthly; 