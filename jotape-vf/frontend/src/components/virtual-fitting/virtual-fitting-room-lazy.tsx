"use client";

import dynamic from "next/dynamic";

const VirtualFittingRoom = dynamic(
  () =>
    import("@/components/virtual-fitting/virtual-fitting-room").then(
      (m) => m.VirtualFittingRoom,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/80 px-6 py-12 text-center text-sm text-zinc-500">
        Cargando probador con cámara…
      </div>
    ),
  },
);

export function VirtualFittingRoomLazy() {
  return <VirtualFittingRoom />;
}
