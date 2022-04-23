import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLocalSearch<T = any>(filterFn: (addr: string) => T[]) {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const result = filterFn(search);

    setData(result);
  }, [filterFn, search]);

  return { search, setSearch, data };
}
