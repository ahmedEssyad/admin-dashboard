import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Line, ComposedChart
} from 'recharts';

const OrdersChart = ({ data }) => {
  const theme = useTheme();
  
  // Si aucune donnée n'est disponible
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f9f9f9',
          borderRadius: 1
        }}
      >
        Aucune donnée disponible pour cette période
      </Box>
    );
  }
  
  // Préparer les données pour le graphique
  const formattedData = data.map(item => ({
    date: item._id,
    commandes: item.count,
    revenus: item.revenue
  }));
  
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            label={{ 
              value: 'Date', 
              position: 'insideBottomRight', 
              offset: -10 
            }}
          />
          <YAxis 
            yAxisId="left"
            label={{ 
              value: 'Nombre de commandes', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ 
              value: 'Revenus (€)', 
              angle: -90, 
              position: 'insideRight' 
            }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'revenus') return [`${value.toFixed(2)} €`, 'Revenus'];
              return [value, 'Commandes'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="commandes" 
            fill={theme.palette.primary.main} 
            name="Commandes"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="revenus" 
            stroke={theme.palette.secondary.main}
            name="Revenus"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default OrdersChart;