import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import workflowReducer from './slices/workflowSlice';

// Root reducer type
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  settings: ReturnType<typeof settingsReducer>;
  workflow: ReturnType<typeof workflowReducer>;
}

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  workflow: workflowReducer,
});

// Configure persist
const persistConfig = {
  key: 'copper-storage',
  storage,
  whitelist: ['auth', 'settings'], // Only persist auth and settings
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export dispatch type
export type AppDispatch = typeof store.dispatch; 