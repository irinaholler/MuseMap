import { create } from "zustand";
import { api } from "../lib/api";

export const useMemories = create((set, get) => ({
    items: [],
    modalOpen: false,
    loading: false,
    pendingCoords: null, // {lat, lng}

    setModal: (open) => set({ modalOpen: open }),

    setPendingCoords: (coords) => set({ pendingCoords: coords, modalOpen: true }),

    fetch: async () => {
        try {
            set({ loading: true });
            const response = await api.get("/memories");
            set({ items: response.data });
        } catch (error) {
            console.error("Error fetching memories:", error);
        } finally {
            set({ loading: false });
        }
    },

    add: async (memoryData) => {
        try {
            set({ loading: true });
            const response = await api.post("/memories", memoryData);
            const newMemory = response.data;

            set(state => ({
                items: [...state.items, newMemory],
                modalOpen: false,
                pendingCoords: null
            }));

            return Promise.resolve(newMemory);
        } catch (error) {
            console.error("Error adding memory:", error);
            alert("Failed to add memory. Please try again.");
            return Promise.reject(error);
        } finally {
            set({ loading: false });
        }
    },

    update: async (id, updateData) => {
        try {
            set({ loading: true });
            const response = await api.put(`/memories/${id}`, updateData);
            const updatedMemory = response.data;

            set(state => ({
                items: state.items.map(item =>
                    item.id === id ? updatedMemory : item
                )
            }));

            return Promise.resolve(updatedMemory);
        } catch (error) {
            console.error("Error updating memory:", error);
            alert("Failed to update memory. Please try again.");
            return Promise.reject(error);
        } finally {
            set({ loading: false });
        }
    },

    delete: async (id) => {
        try {
            set({ loading: true });
            await api.delete(`/memories/${id}`);

            set(state => ({
                items: state.items.filter(item => item.id !== id)
            }));

            return Promise.resolve();
        } catch (error) {
            console.error("Error deleting memory:", error);
            alert("Failed to delete memory. Please try again.");
            return Promise.reject(error);
        } finally {
            set({ loading: false });
        }
    },

    enrich: async (id) => {
        try {
            set({ loading: true });
            const response = await api.post(`/memories/${id}/enrich`);
            const enrichedMemory = response.data;

            set(state => ({
                items: state.items.map(item =>
                    item.id === id ? enrichedMemory : item
                )
            }));
        } catch (error) {
            console.error("Error enriching memory:", error);
            alert("Failed to enrich memory. Please try again.");
        } finally {
            set({ loading: false });
        }
    }
}));