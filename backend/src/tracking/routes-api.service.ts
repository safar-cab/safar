import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface RouteResult {
  distanceMeters: number;
  duration: string;
  distanceKm: number;
  durationMinutes: number;
  polyline?: string;
  tollInfo?: {
    estimatedPrice?: { currencyCode: string; units: string; nanos?: number }[];
  };
  routeLabels?: string[];
}

interface ComputeRoutesResponse {
  routes: RouteResult[];
}

@Injectable()
export class RoutesApiService {
  private readonly logger = new Logger(RoutesApiService.name);
  private readonly apiKey: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_ROUTES_API_KEY', '') ||
      this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      this.logger.warn('Google Routes API not configured — toll info disabled');
    }
  }

  async computeRoutes(
    origin: string,
    destination: string,
    options?: { computeAlternatives?: boolean; includeTolls?: boolean },
  ): Promise<RouteResult[]> {
    if (!this.enabled) return [];

    try {
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: { address: origin },
          destination: { address: destination },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: options?.computeAlternatives ?? true,
          extraComputations: options?.includeTolls
            ? ['TOLLS', 'FUEL_CONSUMPTION']
            : [],
          routeModifiers: {
            vehicleInfo: { emissionType: 'GASOLINE' },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask':
              'routes.distanceMeters,routes.duration,routes.polyline,routes.travelAdvisory.tollInfo,routes.routeLabels',
          },
        },
      );

      const routes = (response.data as ComputeRoutesResponse).routes || [];

      return routes.map((r: any) => ({
        distanceMeters: r.distanceMeters || 0,
        duration: r.duration || '0s',
        distanceKm: Math.round((r.distanceMeters || 0) / 100) / 10,
        durationMinutes: Math.round(
          parseInt((r.duration || '0s').replace('s', '')) / 60,
        ),
        polyline: r.polyline?.encodedPolyline,
        tollInfo: r.travelAdvisory?.tollInfo || null,
        routeLabels: r.routeLabels || [],
      }));
    } catch (error: any) {
      this.logger.error(
        'Routes API failed:',
        error?.response?.data || error.message,
      );
      return [];
    }
  }

  async getRouteTollEstimate(
    origin: string,
    destination: string,
  ): Promise<{
    distanceKm: number;
    durationMinutes: number;
    tollEstimateINR: number;
    routes: Array<{
      distanceKm: number;
      durationMinutes: number;
      tollEstimateINR: number;
      labels: string[];
    }>;
  }> {
    const routes = await this.computeRoutes(origin, destination, {
      computeAlternatives: true,
      includeTolls: true,
    });

    const parsed = routes.map((r) => {
      let tollINR = 0;
      if (r.tollInfo?.estimatedPrice) {
        for (const price of r.tollInfo.estimatedPrice) {
          if (price.currencyCode === 'INR') {
            tollINR = parseInt(price.units || '0');
          }
        }
      }
      return {
        distanceKm: r.distanceKm,
        durationMinutes: r.durationMinutes,
        tollEstimateINR: tollINR,
        labels: r.routeLabels || [],
      };
    });

    // Return cheapest toll route as primary
    const primary =
      parsed.length > 0
        ? parsed.reduce((a, b) =>
            a.tollEstimateINR <= b.tollEstimateINR ? a : b,
          )
        : { distanceKm: 0, durationMinutes: 0, tollEstimateINR: 0, labels: [] };

    return {
      distanceKm: primary.distanceKm,
      durationMinutes: primary.durationMinutes,
      tollEstimateINR: primary.tollEstimateINR,
      routes: parsed,
    };
  }
}
