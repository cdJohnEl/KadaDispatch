import { TrackingPage } from '@/components/tracking/TrackingPage';

interface TrackingPageProps {
  params: {
    id: string;
  };
}

export default function TrackPage({ params }: TrackingPageProps) {
  return <TrackingPage deliveryId={params.id} />;
}