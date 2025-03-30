import useSWR from 'swr';

// const fetcher = (url) => fetch(url).then((res) => res.json());
const fetcher = async (url) => {
  const res = await fetch(url);

  // 상태 코드 확인
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.status = res.status; // 상태 코드 추가
    error.info = await res.json(); // 에러 메시지
    throw error;
  }

  return res.json();
};


export function fetchData(url) {
  const { data, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,  // 캐시 데이터가 오래되어도 자동 갱신 안 함
    revalidateOnFocus: false,  // 브라우저 포커스 시 자동 갱신 안 함
    revalidateOnReconnect: false,
  });
  return {
    data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

