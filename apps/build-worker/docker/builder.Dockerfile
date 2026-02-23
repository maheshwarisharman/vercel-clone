FROM node:20.11.0-alpine3.19

# Install git and other build tools
RUN apk add --no-cache \
    git

RUN addgroup -S builder && adduser -S builder -G builder

WORKDIR /workspace

USER builder

CMD ["/bin/sh"]