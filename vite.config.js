import { defineConfig } from 'vite'
import fs from 'fs'
import react from '@vitejs/plugin-react-swc'

const base64Loader = {
    name: "base64-loader",
    transform(_, id) {
      const [path, query] = id.split("?");
      if (query != "base64") return null;
  
      const data = fs.readFileSync(path);
      const base64 = data.toString("base64");
  
      return `export default '${base64}';`;
    },
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [base64Loader, react()],
    /*build: {
        rollupOptions: {
            output: {
                format: 'esm',
                inlineDynamicImports: true,
            }
        },
    },*/
    
    worker: {
        format: "es",
    },
})


