FROM node:18 as dependencies
WORKDIR /otm
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:18 as builder
WORKDIR /otm
COPY . .
COPY --from=dependencies /otm/node_modules ./node_modules
RUN yarn build

FROM node:18 as runner
WORKDIR /otm
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /otm/next.config.js ./
COPY --from=builder /otm/public ./public
COPY --from=builder /otm/.next ./.next
COPY --from=builder /otm/node_modules ./node_modules
COPY --from=builder /otm/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]
