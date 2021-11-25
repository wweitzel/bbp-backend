const eightMap = new Map();
eightMap.set(1, 1);
eightMap.set(2, 4);
eightMap.set(3, 3);
eightMap.set(4, 2);
eightMap.set(5, 2);
eightMap.set(6, 3);
eightMap.set(7, 4);
eightMap.set(8, 1);

const tenMap = new Map();
tenMap.set(1, 3);
tenMap.set(2, 6);
tenMap.set(3, 5);
tenMap.set(4, 4);
tenMap.set(5, 5);
tenMap.set(6, 5);
tenMap.set(7, 2);
tenMap.set(8, 1);
tenMap.set(9, 1);
tenMap.set(10, 2);

const rankMappings = new Map();
rankMappings.set(8, eightMap);
rankMappings.set(10, tenMap);

module.exports = rankMappings;
