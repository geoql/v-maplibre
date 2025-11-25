import { describe, it, expect } from 'vitest';
import { MapKey, PMTileProtocolKey } from '../../src/utils/symbols';

describe('Symbols', () => {
  describe('MapKey', () => {
    it('should be a symbol', () => {
      expect(typeof MapKey).toBe('symbol');
    });

    it('should have a description', () => {
      expect(MapKey.description).toBe('Map');
    });

    it('should be unique', () => {
      const otherSymbol = Symbol('Map');
      expect(MapKey).not.toBe(otherSymbol);
    });
  });

  describe('PMTileProtocolKey', () => {
    it('should be a symbol', () => {
      expect(typeof PMTileProtocolKey).toBe('symbol');
    });

    it('should have a description', () => {
      expect(PMTileProtocolKey.description).toBe('Protocol');
    });

    it('should be unique', () => {
      const otherSymbol = Symbol('Protocol');
      expect(PMTileProtocolKey).not.toBe(otherSymbol);
    });

    it('should be different from MapKey', () => {
      expect(MapKey).not.toBe(PMTileProtocolKey);
    });
  });
});
