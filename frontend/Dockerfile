FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite incrusta las VITE_* en el bundle al compilar: cambiarlas exige reconstruir la imagen.
# Las URLs vacias hacen que el front use la IP con la que se abrio (sirve en cualquier PC)
ARG VITE_API_BASE_URL=
ARG VITE_AUTH_TOKEN_KEY=token_pos_chiokore
ARG VITE_AUTH_ROLE_KEY=rol_pos_chiokore
ARG VITE_URL_LOGIN_EXTERNO=
ARG VITE_URL_LOGOUT_EXTERNO=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_AUTH_TOKEN_KEY=$VITE_AUTH_TOKEN_KEY \
    VITE_AUTH_ROLE_KEY=$VITE_AUTH_ROLE_KEY \
    VITE_URL_LOGIN_EXTERNO=$VITE_URL_LOGIN_EXTERNO \
    VITE_URL_LOGOUT_EXTERNO=$VITE_URL_LOGOUT_EXTERNO

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
