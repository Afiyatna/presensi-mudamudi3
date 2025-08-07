import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useThemeProvider } from '../utils/ThemeContext';

Chart.register(...registerables);

const HorizontalBarDesa = ({ data, width = 600, height = 340 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { currentTheme } = useThemeProvider();

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext('2d');
    const darkMode = currentTheme === 'dark';

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Total Presensi',
            data: data.values,
            backgroundColor: '#6366f1',
            borderRadius: 8,
            maxBarThickness: 32,
            minBarLength: 2,
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255,255,255,0.95)',
            titleColor: darkMode ? '#f3f4f6' : '#1f2937',
            bodyColor: darkMode ? '#d1d5db' : '#4b5563',
            borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `Total: ${context.parsed.x} presensi`,
            }
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
              beginAtZero: true,
              stepSize: 1
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
            }
          }
        }
      }
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data, currentTheme, height]);

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default HorizontalBarDesa; 