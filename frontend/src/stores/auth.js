import { defineStore } from "pinia";
import api from "../api/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    admin: null,
    token: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      const { data } = await api.post("/auth/login", { email, password });
      this.token = data.token;
      this.admin = { name: data.name, email: data.email, role: data.role };
    },
    logout() {
      this.token = null;
      this.admin = null;
    },
  },
  persist: true,
});
