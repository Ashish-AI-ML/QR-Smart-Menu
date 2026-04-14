FROM alpine:latest

# You can use a newer version of the precompiled binary here if needed
ARG PB_VERSION=0.22.10

RUN apk add --no-cache \
    unzip \
    curl \
    ca-certificates

# Download and unzip PocketBase
RUN curl -L0 https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -o /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /pb/ \
    && rm /tmp/pb.zip

# Create the data directory (this will be used by our Persistent Disk in Render)
VOLUME /pb/pb_data

EXPOSE 8080

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
