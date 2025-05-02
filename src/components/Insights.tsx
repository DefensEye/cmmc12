import React, { useEffect, useState } from 'react';
import { getSecurityFindings } from '../services/googleCloudService';

const Insights: React.FC = () => {
  const [findings, setFindings] = useState([]);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const userId = 'your-user-id'; // Replace with actual user ID logic
        const data = await getSecurityFindings(userId);
        setFindings(data);
      } catch (error) {
        console.error('Error fetching findings:', error);
      }
    };

    fetchFindings();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Insights</h2>
      {findings.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{findings.overallComplianceScore}%</div>
              <div className="text-sm text-gray-500">Overall Compliance Score</div>
            </div>
            <div className="flex space-x-4">
              {findings.safeguardsDistribution.map((safeguard, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl font-bold">{safeguard.count}</div>
                  <div className="text-sm text-gray-500">{safeguard.label}</div>
                </div>
              ))}
            </div>
          </div>
          <ul>
            {findings.details.map((finding, index) => (
              <li key={index} className="mb-2">
                <div className="flex justify-between items-center">
                  <strong>{finding.category}</strong>
                  <span className={`text-sm ${finding.severity === 'Critical' ? 'text-red-600' : 'text-green-600'}`}>
                    {finding.severity}
                  </span>
                </div>
                <p>{finding.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No findings available.</p>
      )}
    </div>
  );
};

export default Insights;