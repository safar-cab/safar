import { useEffect, useRef, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps';
import { cn } from '@/lib/cn';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

interface RouteInfo {
  distance: string;
  distanceValue: number;
  duration: string;
  durationValue: number;
  startAddress: string;
  endAddress: string;
  summary: string;
}

interface DirectionsMapProps {
  origin: string;
  destination: string;
  className?: string;
  showTraffic?: boolean;
  showAlternatives?: boolean;
  onRouteSelect?: (route: RouteInfo, index: number) => void;
  driverPosition?: { lat: number; lng: number } | null;
}

export function DirectionsMap({
  origin,
  destination,
  className,
  showTraffic = true,
  showAlternatives = true,
  onRouteSelect,
  driverPosition,
}: DirectionsMapProps) {
  if (!MAPS_KEY) {
    return (
      <div className={cn('bg-neutral-100 flex items-center justify-center', className)}>
        <p className="text-sm text-neutral-400">Add VITE_GOOGLE_MAPS_KEY to enable maps</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={MAPS_KEY}>
      <Map
        className={cn('w-full h-full', className)}
        defaultCenter={{ lat: 22.7196, lng: 75.8577 }}
        defaultZoom={10}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <DirectionsRenderer
          origin={origin}
          destination={destination}
          showTraffic={showTraffic}
          showAlternatives={showAlternatives}
          onRouteSelect={onRouteSelect}
          driverPosition={driverPosition}
        />
      </Map>
    </APIProvider>
  );
}

function DirectionsRenderer({
  origin,
  destination,
  showTraffic,
  showAlternatives,
  onRouteSelect,
  driverPosition,
}: {
  origin: string;
  destination: string;
  showTraffic?: boolean;
  showAlternatives?: boolean;
  onRouteSelect?: (route: RouteInfo, index: number) => void;
  driverPosition?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [routesSummary, setRoutesSummary] = useState<
    Array<{ summary: string; distance: string; duration: string; durationTraffic?: string }>
  >([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rendererRef = useRef<any>(null);
  const altRenderersRef = useRef<any[]>([]);
  const trafficRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    const service = new routesLib.DirectionsService();
    service.route(
      {
        origin,
        destination,
        travelMode: 'DRIVING' as any,
        provideRouteAlternatives: showAlternatives,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'BEST_GUESS' as any,
        },
      },
      (result: any, status: any) => {
        if (status !== 'OK' || !result) return;

        // Main route
        if (rendererRef.current) rendererRef.current.setMap(null);
        rendererRef.current = new routesLib.DirectionsRenderer({
          map,
          directions: result,
          routeIndex: 0,
          polylineOptions: {
            strokeColor: '#2563EB',
            strokeWeight: 5,
            strokeOpacity: 0.9,
          },
          suppressMarkers: false,
        });

        // Alt routes
        altRenderersRef.current.forEach((r: any) => r.setMap(null));
        altRenderersRef.current = [];
        if (showAlternatives && result.routes.length > 1) {
          for (let i = 1; i < result.routes.length; i++) {
            const alt = new routesLib.DirectionsRenderer({
              map,
              directions: result,
              routeIndex: i,
              polylineOptions: {
                strokeColor: '#94A3B8',
                strokeWeight: 4,
                strokeOpacity: 0.5,
              },
              suppressMarkers: true,
            });
            altRenderersRef.current.push(alt);
          }
        }

        // Build summary
        const summaries = result.routes.map((route: any) => {
          const leg = route.legs[0];
          return {
            summary: route.summary || '',
            distance: leg?.distance?.text || '',
            duration: leg?.duration?.text || '',
            durationTraffic: leg?.duration_in_traffic?.text,
          };
        });
        setRoutesSummary(summaries);

        // Notify parent
        if (onRouteSelect && result.routes[0]?.legs[0]) {
          const leg = result.routes[0].legs[0];
          onRouteSelect(
            {
              distance: leg.distance?.text || '',
              distanceValue: leg.distance?.value || 0,
              duration: leg.duration?.text || '',
              durationValue: leg.duration?.value || 0,
              startAddress: leg.start_address || '',
              endAddress: leg.end_address || '',
              summary: result.routes[0].summary || '',
            },
            0,
          );
        }
      },
    );

    return () => {
      rendererRef.current?.setMap(null);
      altRenderersRef.current.forEach((r: any) => r.setMap(null));
    };
  }, [routesLib, map, origin, destination, showAlternatives]);

  // Traffic layer
  useEffect(() => {
    if (!map) return;
    if (showTraffic) {
      if (!trafficRef.current) {
        trafficRef.current = new (window as any).google.maps.TrafficLayer();
      }
      trafficRef.current.setMap(map);
    } else {
      trafficRef.current?.setMap(null);
    }
    return () => trafficRef.current?.setMap(null);
  }, [map, showTraffic]);

  // Driver marker
  useEffect(() => {
    if (!map || !driverPosition) return;
    const g = (window as any).google;
    if (!g?.maps?.marker?.AdvancedMarkerElement) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:36px;height:36px;background:#2563EB;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
      </div>`;
      markerRef.current = new g.maps.marker.AdvancedMarkerElement({
        map,
        position: driverPosition,
        content: el,
        title: 'Driver',
      });
    } else {
      markerRef.current.position = driverPosition;
    }
    return () => {
      if (markerRef.current) markerRef.current.map = null;
    };
  }, [map, driverPosition]);

  // Route selection
  const selectRoute = useCallback(
    (idx: number) => {
      if (!rendererRef.current || idx >= routesSummary.length) return;
      setSelectedIdx(idx);
      rendererRef.current.setRouteIndex(idx);
    },
    [routesSummary],
  );

  if (routesSummary.length <= 1) return null;

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10">
      <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 space-y-1.5 max-h-44 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold px-1">
          Routes
        </p>
        {routesSummary.map((route, i) => (
          <button
            key={i}
            onClick={() => selectRoute(i)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors',
              i === selectedIdx
                ? 'bg-primary-50 border border-primary-200'
                : 'hover:bg-neutral-50 border border-transparent',
            )}
          >
            <div>
              <p
                className={cn(
                  'font-medium',
                  i === selectedIdx ? 'text-primary-700' : 'text-neutral-700',
                )}
              >
                {route.summary || `Route ${i + 1}`}
              </p>
              <p className="text-xs text-neutral-400">
                {route.distance} · {route.duration}
                {route.durationTraffic && route.durationTraffic !== route.duration && (
                  <span className="text-amber-600"> (traffic: {route.durationTraffic})</span>
                )}
              </p>
            </div>
            {i === selectedIdx && (
              <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                Selected
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
