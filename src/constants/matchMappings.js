const fourMap = new Map();
fourMap.set(1, 3);
fourMap.set(2, 3);
fourMap.set(3, null);

const fiveMap = new Map();
fiveMap.set(1, 2);
fiveMap.set(2, 4);
fiveMap.set(3, 4);
fiveMap.set(4, null);

const sixMap = new Map();
sixMap.set(1, 3);
sixMap.set(2, 4);
sixMap.set(3, 5);
sixMap.set(4, 5);
sixMap.set(5, null);

const sevenMap = new Map();
sevenMap.set(1, 4);
sevenMap.set(2, 5);
sevenMap.set(3, 5);
sevenMap.set(4, 6);
sevenMap.set(5, 6);
sevenMap.set(6, null);

const eightMap = new Map();
eightMap.set(1, 5);
eightMap.set(2, 5);
eightMap.set(3, 6);
eightMap.set(4, 6);
eightMap.set(5, 7);
eightMap.set(6, 7);
eightMap.set(7, null);

const nineMap = new Map();
nineMap.set(1, 2);
nineMap.set(2, 6);
nineMap.set(3, 6);
nineMap.set(4, 7);
nineMap.set(5, 7);
nineMap.set(6, 8);
nineMap.set(7, 8);
nineMap.set(8, null);

const tenMap = new Map();
tenMap.set(1, 3);
tenMap.set(2, 6);
tenMap.set(3, 7);
tenMap.set(4, 7);
tenMap.set(5, 8);
tenMap.set(6, 8);
tenMap.set(7, 9);
tenMap.set(8, 9);
tenMap.set(9, null);

const matchMappings = new Map();
matchMappings.set(4, fourMap);
matchMappings.set(5, fiveMap);
matchMappings.set(6, sixMap);
matchMappings.set(7, sevenMap);
matchMappings.set(8, eightMap);
matchMappings.set(9, nineMap);
matchMappings.set(10, tenMap);

module.exports = matchMappings;
