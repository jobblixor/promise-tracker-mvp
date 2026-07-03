import { useEffect } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  useEffect(() => {
    document.title = 'Dashboard — Promise Tracker';
  }, []);

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
