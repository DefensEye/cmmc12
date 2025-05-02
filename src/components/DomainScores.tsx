import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { DomainSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, Cell } from 'recharts';

interface DomainScoresProps {
  domainSummaries: DomainSummary[];
}

const PRACTICE_COLORS = {
  'Access Control': '#4F46E5',
  'Audit & Accountability': '#10B981',
  'Configuration Management': '#F59E0B',
  'Identification & Authentication': '#EC4899',
  'System & Communications': '#6366F1',
  'System & Information Integrity': '#8B5CF6'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Compliance Score: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#4B5563"
      textAnchor="middle"
      fontSize="12"
    >
      {`${value}%`}
    </text>
  );
};

export const DomainScores: React.FC<DomainScoresProps> = ({ domainSummaries }) => {
  const chartData = domainSummaries.map(domain => ({
    ...domain,
    fill: PRACTICE_COLORS[domain.domain as keyof typeof PRACTICE_COLORS] || '#4F46E5'
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 ml-2">Domain Compliance Scores</h2>
        </div>
      </div>

      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 40, right: 30, left: 60, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="domain"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: '#4B5563', fontSize: 12 }}
            >
              <Label
                value="Practice Domains"
                position="bottom"
                offset={50}
                style={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              tick={{ fill: '#4B5563', fontSize: 12 }}
            >
              <Label
                value="Compliance Score (%)"
                angle={-90}
                position="left"
                offset={45}
                style={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                const code = value.split(' ')[0];
                return `${code} - ${value}`;
              }}
            />
            <Bar
              dataKey="score"
              label={renderCustomBarLabel}
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainSummaries.map((domain) => (
          <div key={domain.domain} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{domain.domain}</span>
              <span className="text-sm font-medium text-gray-600">{domain.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="rounded-full h-2"
                style={{
                  width: `${domain.score}%`,
                  backgroundColor: PRACTICE_COLORS[domain.domain as keyof typeof PRACTICE_COLORS] || '#4F46E5'
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {domain.findings} findings
              </span>
              {domain.criticalFindings > 0 && (
                <span className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {domain.criticalFindings} critical
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


import { AnalysisResult } from './GoogleCloudFindings'; // Assuming type is exported or defined here
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, Cell } from 'recharts';

interface RecommendationsChartProps { // Renamed interface
  analysisResult: AnalysisResult | null;
}

// Simplified color mapping or dynamic generation might be needed
const FAMILY_COLORS: { [key: string]: string } = {
  AC: '#4F46E5', // Access Control
  AU: '#10B981', // Audit & Accountability
  CM: '#F59E0B', // Configuration Management
  IA: '#EC4899', // Identification & Authentication
  SC: '#6366F1', // System & Communications
  SI: '#8B5CF6', // System & Information Integrity
  // Add other families as needed
  UNKNOWN: '#6B7280' // Default color
};

// Helper to extract CMMC Family Prefix (e.g., "AC.L1-3.1.1" -> "AC")
const getCmmcFamily = (controlId: string): string => {
  const parts = controlId.split(/[.-]/); // Split by '.' or '-'
  if (parts.length > 0 && /^[A-Z]{2}$/.test(parts[0])) { // Check if first part is two uppercase letters
    return parts[0];
  }
  return 'UNKNOWN'; // Return UNKNOWN if format doesn't match
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium text-gray-900">Family: {label}</p>
        <p className="text-sm text-gray-600">
          Recommendations: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label for bars (optional, shows count on top)
const renderCustomBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) { // Only show label if value is > 0
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#4B5563"
        textAnchor="middle"
        fontSize="12"
      >
        {value}
      </text>
    );
  }
  return null;
};


// Rename component function
export const RecommendationsPerFamilyChart: React.FC<RecommendationsChartProps> = ({ analysisResult }) => {

  // Process recommendations to count per family
  const recommendations = analysisResult?.recommendations || [];
  const familyCounts: { [key: string]: number } = {};

  recommendations.forEach(rec => {
    const family = getCmmcFamily(rec.control_id);
    familyCounts[family] = (familyCounts[family] || 0) + 1;
  });

  // Prepare data for the chart
  const chartData = Object.entries(familyCounts)
    .map(([family, count]) => ({
      family: family,
      count: count,
      fill: FAMILY_COLORS[family] || FAMILY_COLORS.UNKNOWN
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Handle case where there are no recommendations
  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6 text-center">
         <div className="flex items-center justify-center mb-4">
            <BarChartIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800 ml-2">Recommendations per Control Family</h2>
         </div>
         <p className="text-gray-500">No recommendations were generated by the RAG model.</p>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {/* Use a different icon maybe */}
          <BarChartIcon className="h-8 w-8 text-indigo-600" />
          {/* Update title */}
          <h2 className="text-xl font-bold text-gray-800 ml-2">Recommendations per Control Family</h2>
        </div>
      </div>

      <div className="h-96 mb-6"> {/* Adjust height as needed */}
        <ResponsiveContainer width="100%" height="100%">
          {/* Update chart data and keys */}
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="family" // Use family as key
              // angle={-45} // Maybe remove angle if fewer bars
              // textAnchor="end"
              // height={60} // Adjust height
              interval={0}
              tick={{ fill: '#4B5563', fontSize: 12 }}
            >
              <Label
                value="CMMC Control Family" // Update label
                position="bottom"
                offset={30} // Adjust offset
                style={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              allowDecimals={false} // Ensure integer ticks for counts
              tick={{ fill: '#4B5563', fontSize: 12 }}
            >
              <Label
                value="Number of Recommendations" // Update label
                angle={-90}
                position="left"
                offset={5} // Adjust offset
                style={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            {/* Legend might be less useful here, consider removing */}
            {/* <Legend /> */}
            <Bar
              dataKey="count" // Use count as key
              label={renderCustomBarLabel}
              isAnimationActive={true}
            >
              {/* Use fill color defined in chartData */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Remove the lower section with individual domain progress bars */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> ... </div> */}
    </div>
  );
};

// Consider renaming the file if you adopt this repurposed component
// e.g., to RecommendationsChart.tsx