import { useData } from '../../hooks/useData';
import DashboardView from './DashboardView';

export default function Dashboard() {
  const data = useData();
  return <DashboardView data={data} />;
}
