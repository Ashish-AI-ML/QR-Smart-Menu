FROM alpine:latest

ARG PB_VERSION=0.36.8

RUN apk add --no-cache \
    unzip \
    curl \
    ca-certificates \
    nodejs \
    wget

# Download and unzip PocketBase
RUN curl -L0 https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -o /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /pb/ \
    && rm /tmp/pb.zip

# Copy the auto-seed script and startup script
COPY seed.mjs /pb/seed.mjs
COPY startup.sh /pb/startup.sh
RUN chmod +x /pb/startup.sh

EXPOSE 8080

CMD ["/pb/startup.sh"]
