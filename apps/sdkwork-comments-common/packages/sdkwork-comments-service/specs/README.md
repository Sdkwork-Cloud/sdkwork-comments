# SDKWork Comments Service Specs

This directory declares the component boundary for `@sdkwork/comments-service`.

The service facade composes injected generated app/backend SDK clients. It must not create raw HTTP transports, manual auth headers, or local SDK forks.
