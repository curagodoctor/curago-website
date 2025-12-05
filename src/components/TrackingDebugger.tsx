import { useEffect, useState } from 'react';
import { Card } from './ui/card';

/**
 * Tracking Debugger Component
 * 
 * This component displays the current status of all tracking scripts.
 * Add it to App.tsx temporarily to verify tracking is working on Vercel.
 * 
 * Usage:
 * import { TrackingDebugger } from './components/TrackingDebugger';
 * 
 * Then add <TrackingDebugger /> anywhere in your App component.
 * 
 * IMPORTANT: Remove this component from production once tracking is verified!
 */
export function TrackingDebugger() {
  const [trackingStatus, setTrackingStatus] = useState({
    gtm: false,
    ga4: false,
    dataLayerEvents: 0,
    url: '',
  });

  useEffect(() => {
    // Check tracking status on mount and every 2 seconds
    const checkTracking = () => {
      setTrackingStatus({
        gtm: !!(window as any).dataLayer,
        ga4: !!(window as any).gtag,
        dataLayerEvents: (window as any).dataLayer?.length || 0,
        url: window.location.href,
      });
    };

    checkTracking();
    const interval = setInterval(checkTracking, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTestEvent = () => {
    // Push a test event to all tracking platforms
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'debug_test',
        testTimestamp: new Date().toISOString(),
      });
    }

    if ((window as any).gtag) {
      (window as any).gtag('event', 'debug_test', {
        event_category: 'Debug',
        event_label: 'Manual Test',
      });
    }

    alert('Test event sent! Check your browser console and Network tab.');
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 bg-white shadow-lg border-2 border-red-500 max-w-sm">
      <div className="space-y-2">
        <h3 className="font-bold text-red-600">🔍 Tracking Debug Panel</h3>
        <p className="text-xs text-gray-500">Remove this component in production!</p>
        
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span>GTM DataLayer:</span>
            <span className={trackingStatus.gtm ? 'text-green-600' : 'text-red-600'}>
              {trackingStatus.gtm ? '✅ Loaded' : '❌ Missing'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>GA4 (gtag):</span>
            <span className={trackingStatus.ga4 ? 'text-green-600' : 'text-red-600'}>
              {trackingStatus.ga4 ? '✅ Loaded' : '❌ Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>DataLayer Events:</span>
            <span className="font-mono">{trackingStatus.dataLayerEvents}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600 mb-2">Current URL:</p>
          <p className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
            {trackingStatus.url}
          </p>
        </div>

        <button
          onClick={handleTestEvent}
          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Send Test Event
        </button>

        <div className="pt-2 border-t text-xs space-y-1">
          <p className="font-semibold">Quick Checks:</p>
          <p>• GTM: GTM-PL6KV3ND</p>
          <p>• GA4: G-EFGRF2RMGB</p>
        </div>
      </div>
    </Card>
  );
}
