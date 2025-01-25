
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function fetchData(url) {
  const { data, error, mutate } = useSWR(url, fetcher);

  return {
    swrResult: data,
    isLoading: !error && !data,
    isError: error,
    mutateUser: mutate,
  };
}

