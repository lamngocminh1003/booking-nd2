
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  height?: number;
  weight?: number;
  allergies?: string[];
  medicalHistory?: string;
  insurance?: {
    cardNumber: string;
    expiryDate: string;
  };
}

interface ChildrenState {
  children: Child[];
  selectedChild: string | null;
}

const initialState: ChildrenState = {
  children: [
    {
      id: "1",
      name: "Nguyễn Hoàng An",
      dateOfBirth: "2020-03-15",
      gender: "Nam",
      height: 105,
      weight: 18,
      allergies: ["Đậu phộng"],
    },
    {
      id: "2", 
      name: "Nguyễn Hoàng Minh",
      dateOfBirth: "2018-07-22",
      gender: "Nam",
      height: 120,
      weight: 25,
    }
  ],
  selectedChild: null,
};

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    addChild: (state, action: PayloadAction<Child>) => {
      state.children.push(action.payload);
    },
    updateChild: (state, action: PayloadAction<Child>) => {
      const index = state.children.findIndex(child => child.id === action.payload.id);
      if (index !== -1) {
        state.children[index] = action.payload;
      }
    },
    removeChild: (state, action: PayloadAction<string>) => {
      state.children = state.children.filter(child => child.id !== action.payload);
    },
    setSelectedChild: (state, action: PayloadAction<string | null>) => {
      state.selectedChild = action.payload;
    },
  },
});

export const { addChild, updateChild, removeChild, setSelectedChild } = childrenSlice.actions;
export default childrenSlice.reducer;
