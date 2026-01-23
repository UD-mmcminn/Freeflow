# TODO

## IAM follow-ups

-   Implement local auth (password verification, set/reset flows).
-   Implement `/account/basic-auth`.
-   Implement `/account/billing` (move billing to organization scope later).
-   Implement `/auth/permissions/:type`.
-   Secure the invite endpoint, it currently allows for anyone to invite anybody to any org if they have the org's uuid. This must be secured.
