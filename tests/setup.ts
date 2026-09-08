import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock D3 selection chain object
const createSelectionMock = () => {
  const selection: any = {};
  selection.selectAll = vi.fn().mockReturnValue(selection);
  selection.remove = vi.fn().mockReturnValue(selection);
  selection.attr = vi.fn().mockReturnValue(selection);
  selection.text = vi.fn().mockReturnValue(selection);
  selection.append = vi.fn().mockReturnValue(selection);
  selection.on = vi.fn().mockReturnValue(selection);
  selection.call = vi.fn().mockReturnValue(selection);
  selection.datum = vi.fn().mockReturnValue(selection);
  selection.data = vi.fn().mockReturnValue(selection);
  selection.enter = vi.fn().mockReturnValue(selection);
  selection.transition = vi.fn().mockReturnValue(selection);
  selection.duration = vi.fn().mockReturnValue(selection);
  selection.ease = vi.fn().mockReturnValue(selection);
  return selection;
};

// Mock D3
vi.mock('d3', () => ({
  select: vi.fn(() => createSelectionMock()),
  geoMercator: vi.fn(() => ({
    scale: vi.fn().mockReturnThis(),
    translate: vi.fn().mockReturnThis(),
    center: vi.fn().mockReturnThis(),
    clipExtent: vi.fn().mockReturnThis(),
    invert: vi.fn(() => [0,0]),
  })),
  geoPath: vi.fn(() => {
    const fn: any = vi.fn();
    fn.projection = vi.fn().mockReturnThis();
    fn.bounds = vi.fn(() => [[0, 0], [10, 10]]);
    fn.centroid = vi.fn(() => [5, 5]);
    return fn;
  }),
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

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
