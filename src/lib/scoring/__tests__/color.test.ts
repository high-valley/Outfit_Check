import { classifyColor, hexToHsl } from '../../color';

describe('color utils', () => {
  it('hexToHsl', () => {
    expect(hexToHsl('#FF0000')).toEqual({ h: 0, s: 100, l: 50 });
    expect(hexToHsl('#fff').l).toBe(100);
  });
  it('classifyColor', () => {
    expect(classifyColor('#FFFFFF').group).toBe('neutral:white');
    expect(classifyColor('#808080').group).toBe('neutral:gray');
    expect(classifyColor('#111111').group).toBe('neutral:black');
    expect(classifyColor('#1F2A44').group).toBe('base:navy');
    expect(classifyColor('#E8D8C0').group).toBe('base:beige');
    expect(classifyColor('#FF0000')).toMatchObject({ kind: 'chromatic', tone: 'vivid' });
  });
});
