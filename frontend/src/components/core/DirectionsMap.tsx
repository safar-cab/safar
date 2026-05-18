import { useEffect, useRef, useState, useCallback } from 'react';
import { APIProvider, Map, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { cn } from '@/lib/cn';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

export interface RouteInfo {
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
  /** Change this to force map remount (e.g. selectedRide._id) */
  mapKey?: string;
}

export function DirectionsMap({
  origin,
  destination,
  className,
  showTraffic = true,
  showAlternatives = true,
  onRouteSelect,
  driverPosition,
  mapKey,
}: DirectionsMapProps) {
  const [useFallback, setUseFallback] = useState(false);

  // Reset fallback when route changes
  useEffect(() => {
    setUseFallback(false);
  }, [mapKey, origin, destination]);

  if (!MAPS_KEY) {
    return (
      <div className={cn('bg-neutral-100 flex items-center justify-center', className)}>
        <p className="text-sm text-neutral-400">Add VITE_GOOGLE_MAPS_KEY to enable maps</p>
      </div>
    );
  }

  // Fallback: Google Maps Embed with directions (always shows route)
  if (useFallback) {
    const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;
    return (
      <iframe
        src={embedUrl}
        className={cn('w-full h-full border-0', className)}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <APIProvider apiKey={MAPS_KEY}>
      <Map
        key={mapKey || `${origin}-${destination}`}
        className={cn('w-full h-full', className)}
        defaultCenter={{ lat: 22.7196, lng: 75.8577 }}
        defaultZoom={10}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
      >
        <DirectionsLayer
          origin={origin}
          destination={destination}
          showTraffic={showTraffic}
          showAlternatives={showAlternatives}
          onRouteSelect={onRouteSelect}
          driverPosition={driverPosition}
          onError={() => setUseFallback(true)}
        />
      </Map>
    </APIProvider>
  );
}

// Car SVG for driver marker — top-down view
const CAR_MARKER_HTML = `
<div style="position:relative;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="#2563EB" stroke="white" stroke-width="3"/>
    <g transform="translate(10,8)">
      <rect x="2" y="4" width="16" height="18" rx="4" fill="white"/>
      <rect x="4" y="0" width="12" height="8" rx="2" fill="white"/>
      <rect x="5" y="1" width="10" height="4" rx="1" fill="#93C5FD"/>
      <circle cx="5" cy="20" r="2" fill="#1E40AF"/>
      <circle cx="15" cy="20" r="2" fill="#1E40AF"/>
      <rect x="1" y="10" width="3" height="2" rx="1" fill="#FCD34D"/>
      <rect x="16" y="10" width="3" height="2" rx="1" fill="#FCD34D"/>
    </g>
  </svg>
  <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #2563EB"></div>
</div>`;

function DirectionsLayer({
  origin,
  destination,
  showTraffic,
  showAlternatives,
  onRouteSelect,
  driverPosition,
  onError,
}: {
  origin: string;
  destination: string;
  showTraffic?: boolean;
  showAlternatives?: boolean;
  onRouteSelect?: (route: RouteInfo, index: number) => void;
  driverPosition?: { lat: number; lng: number } | null;
  onError?: () => void;
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

  // Compute directions
  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clean previous
    rendererRef.current?.setMap(null);
    altRenderersRef.current.forEach((r: any) => r.setMap(null));
    altRenderersRef.current = [];
    setSelectedIdx(0);
    setRoutesSummary([]);


    const service = new routesLib.DirectionsService();
    service.route(
      {
        origin,
        destination,
        travelMode: 'DRIVING' as any,
        provideRouteAlternatives: showAlternatives,
      },
      (result: any, status: any) => {
        if (status !== 'OK' || !result) {
          console.error('[DirectionsMap] Directions failed:', status, '— origin:', origin, 'dest:', destination);

          onError?.();
          return;
        }

        // Main route — blue
        rendererRef.current = new routesLib.DirectionsRenderer({
          map,
          directions: result,
          routeIndex: 0,
          polylineOptions: {
            strokeColor: '#2563EB',
            strokeWeight: 5,
            strokeOpacity: 0.9,
          },
          markerOptions: {
            zIndex: 100,
          },
          suppressMarkers: false,
        });

        // Alt routes — gray
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

        // Summaries
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
      rendererRef.current = null;
      altRenderersRef.current.forEach((r: any) => r.setMap(null));
      altRenderersRef.current = [];
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
    return () => {
      trafficRef.current?.setMap(null);
      trafficRef.current = null;
    };
  }, [map, showTraffic]);

  // Driver/cab marker
  useEffect(() => {
    if (!map || !driverPosition) {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      return;
    }

    const g = (window as any).google;

    // Try AdvancedMarkerElement first (requires mapId), fallback to regular Marker
    if (g?.maps?.marker?.AdvancedMarkerElement) {
      if (!markerRef.current) {
        const el = document.createElement('div');
        el.innerHTML = CAR_MARKER_HTML;
        markerRef.current = new g.maps.marker.AdvancedMarkerElement({
          map,
          position: driverPosition,
          content: el,
          title: 'Driver',
          zIndex: 200,
        });
      } else {
        markerRef.current.position = driverPosition;
      }
    } else if (g?.maps?.Marker) {
      if (!markerRef.current) {
        markerRef.current = new g.maps.Marker({
          map,
          position: driverPosition,
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" fill="#2563EB" stroke="white" stroke-width="3"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="16">🚗</text>
              </svg>
            `),
            scaledSize: new g.maps.Size(40, 40),
            anchor: new g.maps.Point(20, 20),
          },
          title: 'Driver',
          zIndex: 200,
        });
      } else {
        markerRef.current.setPosition(driverPosition);
      }
    }

    return () => {
      if (markerRef.current) {
        if (markerRef.current.setMap) markerRef.current.setMap(null);
        else markerRef.current.map = null;
        markerRef.current = null;
      }
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
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200/50 p-2.5 space-y-1 max-h-44 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold px-2">
          {routesSummary.length} Routes Available
        </p>
        {routesSummary.map((route, i) => (
          <button
            key={i}
            onClick={() => selectRoute(i)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all',
              i === selectedIdx
                ? 'bg-primary-50 border border-primary-200 shadow-sm'
                : 'hover:bg-neutral-50 border border-transparent',
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-3 h-1 rounded-full',
                  i === selectedIdx ? 'bg-primary-500' : 'bg-neutral-300',
                )}
              />
              <div>
                <p
                  className={cn(
                    'font-medium text-xs',
                    i === selectedIdx ? 'text-primary-700' : 'text-neutral-700',
                  )}
                >
                  {route.summary || `Route ${i + 1}`}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {route.distance} · {route.duration}
                  {route.durationTraffic && route.durationTraffic !== route.duration && (
                    <span className="text-amber-600"> ({route.durationTraffic} in traffic)</span>
                  )}
                </p>
              </div>
            </div>
            {i === selectedIdx && (
              <span className="text-[9px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
