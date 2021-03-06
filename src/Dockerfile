# build react components for production mode
FROM node:12-alpine AS node-webpack
WORKDIR /usr/src/app

# NOTE: package.json and webpack.config.js not likely to change between dev builds
COPY package.json package-lock.json webpack.config.js tsconfig.json /usr/src/app/
RUN npm install

# NOTE: assets/ likely to change between dev builds
COPY assets /usr/src/app/assets
RUN npm run prod

#####################################################################

FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
EXPOSE 8000
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV GUNICORN_WORKERS=2
ENV GUNICORN_THREADS=4

RUN pip install gunicorn psycopg2-binary
COPY requirements.txt /tmp
RUN pip install -r /tmp/requirements.txt

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD ["sh", "-c", "gunicorn --bind=0.0.0.0:8001 --workers=${GUNICORN_WORKERS} --threads=${GUNICORN_THREADS} --access-logfile=- --log-file=- officehours.wsgi"]

COPY --from=node-webpack /usr/src/app/package-lock.json package-lock.json
COPY --from=node-webpack /usr/src/app/webpack-stats.json webpack-stats.json
COPY --from=node-webpack /usr/src/app/assets assets
COPY --from=node-webpack /usr/src/app/node_modules node_modules

COPY . /usr/src/app
RUN chmod -R g+rw /usr/src/app
