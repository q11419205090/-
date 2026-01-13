export const getRandomItems = <T>(pool: T[], count: number): T[] => {
  if (count <= 0) {
    return [];
  }

  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const getRandomItem = <T>(pool: T[]): T | null => {
  if (pool.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};
