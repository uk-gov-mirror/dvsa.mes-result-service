# mes-result-service

A service to receive test results from the MES mobile app.

## Structure

All serverless functions live in dedicated directories in `src/functions`.
Code that is common between multiple functions should reside in `src/common`.

As per the principles of Hexagonal Architecture, each function has the following directories to help us separate concerns:

* `framework` - contains all Inbound and Outbound Adapters, and all use of external/proprietary APIs - depends upon...
* `application` - contains all Inbound and Outbound Ports, doesn't use any external/proprietary APIs - depends upon...
* `domain` - contains all domain objects (Aggregates, Objects, Value classes etc) with all "business logic" (not just anaemic data holders), doesn't use any external/proprietary APIs.

## Run locally

Use the following script to spin up the microservice locally

```shell
npm start
```

## Build

To build a zip file for every function to `build/artifacts`, run:

```shell
npm run package
```

To build a subset of the functions, pass a comma separated list of function names, like so:

```shell
npm run package -- get,set
```

*N.b. The build requires [jq](https://github.com/stedolan/jq).*

*Any functions delcared in serverless.yml that contain the word "local" will be ignored in the packaging process.*

## Test

### Unit tests

To run the unit tests, simply run:

```shell
npm test
```

### Integration tests

There are some integration tests, each of which can be found in the `__tests__` directory of the source tree with the `.int.ts` extension.

A pre-requisite for running these integration tests is that you have a Docker container running MySQL locally.

```shell
cd spec/infra
docker-compose up
```

The integration tests can then be run with:

```shell
npm run test:int
```

Note, the database container should be destroyed after each test run to ensure the state is clean:

```shell
cd spec/infra
docker-compose down
```
