'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapPickerProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    popup?: string;
    color?: string;
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function MapPicker({
  center = [-5.4254, 105.2580],
  zoom = 12,
  markers = [],
  onLocationSelect,
  interactive = true,
  style,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create colored marker
    const createIcon = (color = '#ef4444') =>
      L.divIcon({
        html: `<div style="
          width:24px;height:24px;border-radius:50% 50% 50% 0;
          background:${color};border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
        className: '',
      });

    // Add initial markers
    const markerInstances: any[] = [];
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: createIcon(m.color) }).addTo(map);
      if (m.popup) marker.bindPopup(m.popup);
      markerInstances.push(marker);
    });

    // Store marker instances to map so we can update them later
    (map as any)._customMarkers = markerInstances;
    (map as any)._createIcon = createIcon;

    // Interactive click
    if (interactive && onLocationSelect) {
      let clickMarker: unknown = null;
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        if (clickMarker) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (clickMarker as any).setLatLng([lat, lng]);
        } else {
          clickMarker = L.marker([lat, lng], { icon: createIcon('#16a34a'), draggable: true }).addTo(map);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (clickMarker as any).on('dragend', (de: any) => {
            const pos = de.target.getLatLng();
            onLocationSelect(pos.lat, pos.lng);
          });
        }
        onLocationSelect(lat, lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // Only run once on mount

  const centerLat = center?.[0];
  const centerLng = center?.[1];

  // Update map center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && centerLat !== undefined && centerLng !== undefined) {
      const map = mapInstanceRef.current as any;
      map.setView([centerLat, centerLng], map.getZoom());
    }
  }, [centerLat, centerLng]);

  const markersJson = JSON.stringify(markers);

  // Update markers when prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current as any;
      
      // Remove old markers
      if (map._customMarkers) {
        map._customMarkers.forEach((marker: any) => marker.remove());
      }
      
      // Add new markers
      const markerInstances: any[] = [];
      const createIcon = map._createIcon;
      if (createIcon && markers) {
        markers.forEach((m) => {
          const marker = L.marker([m.lat, m.lng], { icon: createIcon(m.color) }).addTo(map);
          if (m.popup) marker.bindPopup(m.popup);
          markerInstances.push(marker);
        });
        map._customMarkers = markerInstances;
      }
    }
  }, [markersJson]);

  if (!mounted) {
    return (
      <div
        style={{
          ...style,
          background: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '14px',
        }}
      >
        Memuat peta...
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%', ...style }} />;
}
