import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './AnalyticsPage.css';

const PIE_COLORS = ['#f0e68c', '#add8e6', '#90ee90', '#f08080', '#ffa500'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.shop_id) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get('/shopkeeper/analytics', {
          params: { shop_id: user.shop_id }
        });
        setData(response.data);
      } catch (err) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) return <div className="analytics-page">Loading analytics...</div>;
  if (error) return <div className="analytics-page error">{error}</div>;
  if (!data) return <div className="analytics-page">No data found.</div>;

  return (
    <div className="analytics-page">
      <h1>Shop Analytics</h1>
      
      <div className="stat-cards-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          {/* --- FIX: Changed $ to ₹ --- */}
          <p>₹{data.total_revenue.toFixed(2)}</p>
          <span>(From {data.order_status_data.find(s => s.status === 'Delivered')?.count || 0} delivered orders)</span>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{data.total_orders}</p>
          <span>(All time)</span>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>★ {data.average_rating.toFixed(1)}</p>
          <span>(From {data.total_reviews} reviews)</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Over Time (Delivered)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenue_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              {/* --- FIX: Changed $ to ₹ --- */}
              <YAxis allowDecimals={false} prefix="₹" />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#E07A5F" 
                strokeWidth={2} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.order_status_data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {data.order_status_data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;