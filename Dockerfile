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

# Chạy Next.js ở chế độ Production (Cổng mặc định 3000)
# Bạn cũng có thể dùng `pnpm run pm2` nếu có file hệ sinh thái PM2.
CMD ["pnpm", "run", "start:prod:frontend"]
