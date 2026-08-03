import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SidebarState = "expanded" | "collapsed";

type UIState = {
  sidebarState: SidebarState;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isNotificationsPanelOpen: boolean;
  theme: "light" | "dark" | "system";
  statsHidden: boolean;
};

type UIActions = {
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setStatsHidden: (hidden: boolean) => void;
  toggleStats: () => void;
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      sidebarState: "expanded",
      isMobileMenuOpen: false,
      isSearchOpen: false,
      isNotificationsPanelOpen: false,
      theme: "system",
      statsHidden: false,

      setSidebarState: (state) => set({ sidebarState: state }),
      
      toggleSidebar: () =>
        set((state) => ({
          sidebarState: state.sidebarState === "expanded" ? "collapsed" : "expanded",
        })),

      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

      setSearchOpen: (open) => set({ isSearchOpen: open }),
      
      toggleSearch: () =>
        set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      setNotificationsPanelOpen: (open) => set({ isNotificationsPanelOpen: open }),
      
      toggleNotificationsPanel: () =>
        set((state) => ({ isNotificationsPanelOpen: !state.isNotificationsPanelOpen })),

      setTheme: (theme) => set({ theme }),

      setStatsHidden: (hidden) => set({ statsHidden: hidden }),
      
      toggleStats: () =>
        set((state) => ({ statsHidden: !state.statsHidden })),
    }),
    {
      name: "eagle-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarState: state.sidebarState,
        theme: state.theme,
        statsHidden: state.statsHidden,
      }),
    }
  )
);

