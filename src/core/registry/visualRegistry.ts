import React from 'react';

export interface VisualComponentProps {
  props: Record<string, unknown>;
  isInteractive?: boolean;
  onInteract?: (data: unknown) => void;
  lang?: string;
  compact?: boolean;
}

export type VisualComponentType = React.ComponentType<VisualComponentProps>;

export interface VisualRegistryInterface {
  register(visualType: string, component: VisualComponentType): void;
  get(visualType: string): VisualComponentType | undefined;
  has(visualType: string): boolean;
  unregister?(visualType: string): void;
  clear?(): void;
}

export class VisualRegistry implements VisualRegistryInterface {
  private registry = new Map<string, VisualComponentType>();

  register(visualType: string, component: VisualComponentType): void {
    this.registry.set(visualType, component);
  }

  get(visualType: string): VisualComponentType | undefined {
    return this.registry.get(visualType);
  }

  has(visualType: string): boolean {
    return this.registry.has(visualType);
  }

  unregister(visualType: string): void {
    this.registry.delete(visualType);
  }

  clear(): void {
    this.registry.clear();
  }
}

export const visualRegistry = new VisualRegistry();
