FROM node:22-bookworm-slim

# Cài đặt công cụ cần thiết
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ make python3-pip bash && rm -rf /var/lib/apt/lists/*

RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1 pm2

WORKDIR /app
COPY . .

# Thay thế biến API thành domain thật Backend của bạn
ARG NEXT_PUBLIC_BACKEND_URL="https://vaiclaw.vaimix.com/api"
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Cài đặt packages và Build
RUN pnpm install
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

# Chạy Next.js ở chế độ Production (Cổng 4200 như cài đặt của frontend)
CMD ["npx", "next", "start", "apps/frontend", "-p", "4200"]
