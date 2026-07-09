import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    datum: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    transition: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
    ease: vi.fn().mockReturnThis(),
  })),
  geoMercator: vi.fn(() => ({
    scale: vi.fn().mockReturnThis(),
    translate: vi.fn().mockReturnThis(),
    center: vi.fn().mockReturnThis(),
    clipExtent: vi.fn().mockReturnThis(),
    invert: vi.fn(() => [0,0]),
  })),
  geoPath: vi.fn(() => vi.fn()),
  geoGraticule: vi.fn(() => ({
    outline: vi.fn(),
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    transform: vi.fn().mockReturnThis(),
  })),
  easeCubicInOut: vi.fn(),
  pointer: vi.fn(() => [0,0]),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
