import {
  useState,
  useCallback,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import type { Pagination } from "../types";

interface UseQuotesListReturn<T, U> {
  list: U[];
  setList: Dispatch<SetStateAction<U[]>>;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (newFilter: T) => void;
}

export function useList<T, U>(
  initialFilter: T,
  getFunc: (
    params: T & { page: number; pageSize: number },
  ) => Promise<{ list: U[]; pagination: Pagination }>,
  pageSize = 8,
): UseQuotesListReturn<T, U> {
  const [list, setList] = useState<U[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<Omit<Pagination, "totalPages">>({
    total: 0,
    page: 1,
    pageSize,
  });

  // 保存当前筛选条件，用于刷新时复用
  const filterRef = useRef<T>(initialFilter);

  // 通用请求方法
  const fetchList = useCallback(
    async (page: number, isLoadMore: boolean = false) => {
      const params = {
        ...filterRef.current,
        page,
        pageSize,
      };
      const data = await getFunc(params);
      const { list, pagination: pag } = data;

      if (isLoadMore) {
        setList((prev) => [...prev, ...list]);
      } else {
        setList(list);
      }

      setPagination(pag);
      setHasMore(pag.page < pag.totalPages);
      return data;
    },
    [pageSize],
  );

  // 重置并加载第一页（用于筛选条件变化或主动刷新）
  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      await fetchList(1, false);
    } catch (error) {
      console.error("加载失败:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // 下拉刷新
  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchList(1, false);
    } catch (error) {
      console.error("刷新失败:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchList, refreshing]);

  // 上拉加载更多
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      await fetchList(nextPage, true);
    } catch (error) {
      console.error("加载更多失败:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, pagination.page, fetchList]);

  // 更新筛选条件（外部调用）
  const setFilter = useCallback(
    (newFilter: T) => {
      filterRef.current = newFilter;
      loadFirstPage();
    },
    [loadFirstPage],
  );

  // 初始化加载
  useEffect(() => {
    loadFirstPage();
  }, []); // 仅在 mount 时执行一次，后续筛选变化由 setFilter 触发

  return {
    list,
    setList,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    setFilter,
  };
}
