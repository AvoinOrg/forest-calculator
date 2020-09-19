# forest-calculator ([https://hiililaskuri.com](https://hiililaskuri.com))
A web app prototype for searching the carbon statistics of Finnish municipalities and estates. 

### Build
    yarn run build-update
    node server.js
 
Requires municipalities.json, provinces.json, and the following env variables:

    PG_USER               # Postgres username
    PG_PASSWORD           # Postgres password
    PG_HOST               # Postgres host address
    PG_DBNAME             # Postgres database name
    PG_PORT               # Postgres service port
    API_URL               # The URL of the server
    NODEMAILER_USER       # Mail account used by Nodemailer
    NODEMAILER_PASS       # Password for mail
    NODEMAILER_EMAIL      # Email address used by Nodemailer
    NODE_ENV              # "production" or "development"
    SSL_PATH              # Path to SSL keys
  
See .example files.
