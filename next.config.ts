import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cabeçalhos defensivos aplicados pela camada web. A CSP evita conteúdo de
   * terceiros por padrão. `unsafe-inline` permanece temporariamente em script e
   * estilo porque o Next injeta o bootstrap RSC e os indicadores calculam larguras
   * inline. A retirada depende da introdução de nonce por resposta.
   */
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}; connect-src 'self' http://127.0.0.1:3100 http://localhost:3100` },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;

