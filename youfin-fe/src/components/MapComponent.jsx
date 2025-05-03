import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ role }) {
  const businesses = [
    { id: 1, name: 'Burger Place', lat: 48.208, lng: 16.373, coupon: true },
    { id: 2, name: 'Raiffeisen Info', lat: 48.209, lng: 16.372, info: true }
  ];

  return (
    <MapContainer center={[48.208, 16.373]} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {businesses.map(biz => (
        <Marker key={biz.id} position={[biz.lat, biz.lng]}>
          <Popup>
            <b>{biz.name}</b>
            {biz.coupon && <button className="mt-2 text-blue-500">🎉 Claim Coupon</button>}
            {biz.info && <p className="text-sm mt-1">Learn how to save money here!</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}