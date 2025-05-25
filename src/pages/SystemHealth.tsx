
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';

const SystemHealth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            System Health Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor the health and integrity of database tables and core systems
          </p>
        </div>
        
        <SystemHealthDashboard />
      </div>
    </div>
  );
};

export default SystemHealth;
