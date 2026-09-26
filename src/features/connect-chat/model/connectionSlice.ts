import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ConnectionData } from "./types";

type ConnectionState = {
  data: ConnectionData | null;
};

const initialState: ConnectionState = {
  data: null,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConnection(state, action: PayloadAction<ConnectionData>) {
      state.data = action.payload;
    },
  },
  selectors: {
    selectConnection: (state) => state.data,
  },
});

export const { setConnection } = connectionSlice.actions;
export const connectionReducer = connectionSlice.reducer;
export const { selectConnection } = connectionSlice.selectors;
