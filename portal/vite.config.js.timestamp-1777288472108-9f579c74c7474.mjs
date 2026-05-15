// vite.config.js
import path from "node:path";
import { defineConfig } from "file:///D:/ReactJS%20PRO-jects/DrDesignProject/MavenJobs/client/node_modules/vite/dist/node/index.js";
import react from "file:///D:/ReactJS%20PRO-jects/DrDesignProject/MavenJobs/client/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/ReactJS%20PRO-jects/DrDesignProject/MavenJobs/client/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\ReactJS PRO-jects\\DrDesignProject\\MavenJobs\\client";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^gsap$/,
        replacement: path.resolve(__vite_injected_original_dirname, "node_modules/gsap/index.js")
      },
      {
        find: /^gsap\/ScrollTrigger$/,
        replacement: path.resolve(__vite_injected_original_dirname, "node_modules/gsap/ScrollTrigger.js")
      }
    ]
  },
  optimizeDeps: {
    include: ["gsap", "gsap/ScrollTrigger"]
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxSZWFjdEpTIFBSTy1qZWN0c1xcXFxEckRlc2lnblByb2plY3RcXFxcTWF2ZW5Kb2JzXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUmVhY3RKUyBQUk8tamVjdHNcXFxcRHJEZXNpZ25Qcm9qZWN0XFxcXE1hdmVuSm9ic1xcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1JlYWN0SlMlMjBQUk8tamVjdHMvRHJEZXNpZ25Qcm9qZWN0L01hdmVuSm9icy9jbGllbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogW1xuICAgICAge1xuICAgICAgICBmaW5kOiAvXmdzYXAkLyxcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwibm9kZV9tb2R1bGVzL2dzYXAvaW5kZXguanNcIiksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaW5kOiAvXmdzYXBcXC9TY3JvbGxUcmlnZ2VyJC8sXG4gICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIm5vZGVfbW9kdWxlcy9nc2FwL1Njcm9sbFRyaWdnZXIuanNcIiksXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcImdzYXBcIiwgXCJnc2FwL1Njcm9sbFRyaWdnZXJcIl0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIHBvcnQ6IDUxNzMsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlYsT0FBTyxVQUFVO0FBQzlXLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQ2hDLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLEtBQUssUUFBUSxrQ0FBVyw0QkFBNEI7QUFBQSxNQUNuRTtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWEsS0FBSyxRQUFRLGtDQUFXLG9DQUFvQztBQUFBLE1BQzNFO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxRQUFRLG9CQUFvQjtBQUFBLEVBQ3hDO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
