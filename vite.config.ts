import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

const placementApiPlugin = () => {
  const frontendImagesDir = path.resolve(__dirname, "../AITD-frontend/public/site/mastersunion.org/images");

  const readBody = (req: any) =>
    new Promise<string>((resolve, reject) => {
      let body = "";
      req.on("data", (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on("end", () => resolve(body));
      req.on("error", reject);
    });

  return {
    name: "vite-placement-api",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith("/api/placements")) {
          return next();
        }

        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          if (req.method === "GET") {
            const metadataPath = path.join(frontendImagesDir, "placement-data.json");
            let metadata: any[] = [];
            if (fs.existsSync(metadataPath)) {
              try {
                metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
              } catch {
                metadata = [];
              }
            }

            const items = Array.isArray(metadata)
              ? metadata
                  .map((item) => {
                    if (!item || typeof item.id !== "string") return null;
                    const fileName = typeof item.imageFileName === "string" ? item.imageFileName : `placement-${item.id}.jpg`;
                    const filePath = path.join(frontendImagesDir, fileName);
                    if (!fs.existsSync(filePath)) return null;
                    const buffer = fs.readFileSync(filePath);
                    const preview = `data:image/jpeg;base64,${buffer.toString("base64")}`;
                    return {
                      id: item.id,
                      name: item.name ?? "",
                      role: item.role ?? "",
                      company: item.company ?? "",
                      specialization: item.specialization ?? "",
                      batch: item.batch ?? "",
                      imageFileName: fileName,
                      preview,
                    };
                  })
                  .filter(Boolean)
              : [];

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ items }));
            return;
          }

          if (req.method === "POST") {
            const raw = await readBody(req);
            const payload = JSON.parse(raw || "{}");
            const items = Array.isArray(payload.items) ? payload.items : [];

            fs.mkdirSync(frontendImagesDir, { recursive: true });
            const saved: Array<any> = [];
            const postedFiles = new Set<string>();

            for (const item of items) {
              if (!item || typeof item.id !== "string") continue;
              const fileName = typeof item.imageFileName === "string" ? item.imageFileName : `placement-${item.id}.jpg`;
              const filePath = path.join(frontendImagesDir, fileName);

              if (typeof item.dataUrl === "string") {
                const match = item.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
                if (match) {
                  const [, , base64] = match;
                  const buffer = Buffer.from(base64, "base64");
                  fs.writeFileSync(filePath, buffer);
                }
              }

              if (!fs.existsSync(filePath)) continue;
              const buffer = fs.readFileSync(filePath);
              const preview = `data:image/jpeg;base64,${buffer.toString("base64")}`;
              saved.push({
                id: item.id,
                name: item.name ?? "",
                role: item.role ?? "",
                company: item.company ?? "",
                specialization: item.specialization ?? "",
                batch: item.batch ?? "",
                imageFileName: fileName,
                preview,
              });
              postedFiles.add(fileName);
            }

            const existingFiles = fs.existsSync(frontendImagesDir)
              ? fs.readdirSync(frontendImagesDir).filter((name) => name.startsWith("placement-") && name.endsWith(".jpg"))
              : [];
            for (const fileName of existingFiles) {
              if (!postedFiles.has(fileName)) {
                fs.unlinkSync(path.join(frontendImagesDir, fileName));
              }
            }

            const metadataPath = path.join(frontendImagesDir, "placement-data.json");
            fs.writeFileSync(
              metadataPath,
              JSON.stringify(
                saved.map((item) => ({
                  id: item.id,
                  name: item.name,
                  role: item.role,
                  company: item.company,
                  specialization: item.specialization,
                  batch: item.batch,
                  imageFileName: item.imageFileName,
                })),
                null,
                2
              ),
              "utf-8"
            );

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ items: saved }));
            return;
          }

          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }));
        }
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [placementApiPlugin(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
