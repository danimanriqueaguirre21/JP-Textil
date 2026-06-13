"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = {
  error: Error | null;
};

/** Captura fallos de useGLTF (Failed to fetch, timeout en GLB grande). */
export class AvatarModelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[AvatarModelErrorBoundary]", error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      const msg = this.state.error.message;
      const isFetch = /fetch|network|load/i.test(msg);
      return (
        <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm font-medium text-zinc-800">
            No se pudo cargar el modelo 3D
          </p>
          <p className="max-w-sm text-xs text-zinc-500">
            {isFetch
              ? "El archivo GLB es muy pesado o la conexión se cortó. En dev usamos el basemesh ligero; recarga o revisa que el servidor esté activo."
              : msg}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-medium text-violet-800 hover:bg-violet-100"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
