import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "./reducers/themeSlice";
import notificationSlice from "./reducers/notificationSlice";
import toggleSlice from "./reducers/toggleSlice";
import refetchSlice from "./reducers/refetchSlice";
import followersSlice from "./reducers/followersSlice";

export const store = configureStore({
  reducer: {
    theme: themeSlice,
    notification: notificationSlice,
    toggle: toggleSlice,
    refetch: refetchSlice,
    activeFollowers: followersSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
