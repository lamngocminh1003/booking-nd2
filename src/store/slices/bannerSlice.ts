import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Define Banner interface
export interface Banner {
  id: number;
  image: string;
  displayName: string;
  status: boolean;
  href: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BannerResponse {
  message: string;
  data: {
    allBanner: Banner[];
    meta: {
      page: number;
      pageSize: number;
      totalBanners: number;
    };
  };
}

export interface BannerState {
  banners: Banner[];
  activeBanners: Banner[];
  loading: boolean;
  error: string | null;
  meta: {
    page: number;
    pageSize: number;
    totalBanners: number;
  } | null;
}

const initialState: BannerState = {
  banners: [],
  activeBanners: [],
  loading: false,
  error: null,
  meta: null,
};

// ✅ Async thunk to fetch banners
export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    type?: string;
  }) => {
    try {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.pageSize)
        searchParams.append("pageSize", params.pageSize.toString());
      if (params?.keyword) searchParams.append("keyword", params.keyword);
      if (params?.type) searchParams.append("type", params.type);

      const response = await fetch(
        `https://benhviennhi.org.vn/api/banner/?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BannerResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Banner fetch error:", error);
      throw error;
    }
  }
);

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearBanners: (state) => {
      state.banners = [];
      state.activeBanners = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data.allBanner;
        // ✅ Filter only active banners (status: true)
        state.activeBanners = action.payload.data.allBanner.filter(
          (banner) => banner.status === true
        );
        state.meta = action.payload.data.meta;
        state.error = null;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch banners";
      });
  },
});

export const { clearBanners, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
