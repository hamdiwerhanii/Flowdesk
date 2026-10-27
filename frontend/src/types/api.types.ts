export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};
