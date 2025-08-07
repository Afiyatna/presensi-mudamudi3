import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useThemeProvider } from '../utils/ThemeContext';

Chart.register(...registerables);

const LineChartTrend = ({ data, width = 400, height = 200 }) => {
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
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          ...dataset,
          borderWidth: 3,
          pointBackgroundColor: dataset.borderColor,
          pointBorderColor: darkMode ? '#1f2937' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          fill: true,
          tension: 0.4,
          backgroundColor: dataset.backgroundColor || dataset.borderColor + '20'
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
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
            backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: darkMode ? '#f3f4f6' : '#1f2937',
            bodyColor: darkMode ? '#d1d5db' : '#4b5563',
            borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => {
                return `Tanggal: ${context[0].label}`;
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y} orang`;
              }
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
              font: { size: 11 },
              maxRotation: 45
            }
          },
          y: {
            grid: {
              color: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)',
              drawBorder: false
            },
            ticks: {
              color: darkMode ? '#9ca3af' : '#6b7280',
              font: { size: 11 },
              beginAtZero: true,
              stepSize: 1
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 6,
            radius: 4
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, currentTheme]);

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default LineChartTrend; 