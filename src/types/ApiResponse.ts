export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    pagination?: PaginationMeta;
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ErrorDetail {
  field: string;
  message: string;
  value?: any;
}
