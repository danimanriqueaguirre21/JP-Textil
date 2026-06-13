import type { Metadata } from "next";

import { BodyScanFlow } from "@/components/body-scan/body-scan-flow";

export const metadata: Metadata = {
  title: "Escaneo corporal",
  description:
    "Captura guiada frontal y lateral para medidas corporales con visión por computadora.",
};

export default function BodyScanPage() {
  return <BodyScanFlow variant="account" />;
}
