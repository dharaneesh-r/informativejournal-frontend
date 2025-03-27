'use client';
import { useEffect, useRef } from 'react';
import pannellum from 'pannellum';

export default function Photo360Viewer({ imageUrl, hotspots = [] }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = pannellum.viewer(viewerRef.current, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      showControls: true,
      hotspots: hotspots.map(hotspot => ({
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        text: hotspot.text,
        cssClass: 'custom-hotspot'
      }))
    });

    return () => viewer.destroy();
  }, [imageUrl, hotspots]);

  return (
    <div 
      ref={viewerRef} 
      className="w-full h-[400px] rounded-lg shadow-xl"
    />
  );
}