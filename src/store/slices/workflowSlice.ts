import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkflowItem {
  id: string;
  stage: number;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowState {
  currentStage: number;
  workflowItems: WorkflowItem[];
}

const initialState: WorkflowState = {
  currentStage: 1,
  workflowItems: [],
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setCurrentStage: (state, action: PayloadAction<number>) => {
      state.currentStage = action.payload;
    },
    addWorkflowItem: (state, action: PayloadAction<WorkflowItem>) => {
      state.workflowItems.push(action.payload);
    },
    updateWorkflowItem: (state, action: PayloadAction<{ id: string; updates: Partial<WorkflowItem> }>) => {
      const { id, updates } = action.payload;
      const item = state.workflowItems.find(item => item.id === id);
      if (item) {
        Object.assign(item, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
    },
    removeWorkflowItem: (state, action: PayloadAction<string>) => {
      state.workflowItems = state.workflowItems.filter(item => item.id !== action.payload);
    },
  },
});

export const {
  setCurrentStage,
  addWorkflowItem,
  updateWorkflowItem,
  removeWorkflowItem,
} = workflowSlice.actions;

// Selector to get workflow items by stage
export const selectWorkflowItemsByStage = (state: { workflow: WorkflowState }, stage: number) =>
  state.workflow.workflowItems.filter(item => item.stage === stage);

export default workflowSlice.reducer; 