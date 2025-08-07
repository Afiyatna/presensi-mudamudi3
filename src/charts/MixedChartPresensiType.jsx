import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useThemeProvider } from '../utils/ThemeContext';

Chart.register(...registerables);

const MixedChartPresensiType = ({ data, width = 600, height = 280 }) => {
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
            type: 'bar',
            label: 'Presensi Daerah',
            data: data.daerah,
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            maxBarThickness: 32,
            order: 1,
          },
          {
            type: 'line',
            label: 'Presensi Desa',
            data: data.desa,
            borderColor: '#f59e42',
            backgroundColor: 'rgba(245, 158, 66, 0.15)',
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f59e42',
            pointBorderColor: darkMode ? '#1f2937' : '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 3,
            order: 2,
            yAxisID: 'y',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: darkMode ? '#9ca3af' : '#6b7280',
              font: { size: 12 },
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255,255,255,0.95)',
            titleColor: darkMode ? '#f3f4f6' : '#1f2937',
            bodyColor: darkMode ? '#d1d5db' : '#4b5563',
            borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => `Bulan: ${context[0].label}`,
              label: (context) => `${context.dataset.label}: ${context.parsed.y} presensi`,
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
  }, [data, currentTheme, height]);

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default MixedChartPresensiType; 