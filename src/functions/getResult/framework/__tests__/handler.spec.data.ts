import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { TestResultRecord } from '../../../../common/domain/test-results';
import { SearchResultTestSchema } from '@dvsa/mes-search-schema';

// tslint:disable: variable-name
export const sampleToken_12345678 =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1zeE1\KTUxDSURXTVRQdlp5SjZ0eC1DRHh\
3MCIsImtpZCI6Ii1zeE1KTUxDSURXTVRQdlp5SjZ0eC1DRHh3MCJ9.eyJhdWQiOiIwOWZkZDY4Yy00ZjJmLTQ1YzItYmU1N\
S1kZDk4MTA0ZDRmNzQiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82YzQ0OGQ5MC00Y2ExLTRjYWYtYWI1OS0w\
YTJhYTY3ZDc4MDEvIiwiaWF0IjoxNTUxODAxMjIwLCJuYmYiOjE1NTE4MDEyMjAsImV4cCI6MTU1MTgwMjcyMCwiYWNyIjo\
iMSIsImFpbyI6IjQySmdZTENVTXI4cTFocVNmMTdpVVcwSGErWVIzcHkwYjU0SjJwK3YySzRwRFBaOEd3NEEiLCJhbXIiOl\
sicHdkIl0sImFwcGlkIjoiMDlmZGQ2OGMtNGYyZi00NWMyLWJlNTUtZGQ5ODEwNGQ0Zjc0IiwiYXBwaWRhY3IiOiIwIiwiZ\
Xh0bi5lbXBsb3llZUlkIjpbIjEyMzQ1Njc4Il0sImlwYWRkciI6IjE0OC4yNTMuMTM0LjIxMyIsIm5hbWUiOiJNRVNCZXRh\
IHVzZXIiLCJvaWQiOiI4ZDU3OWFiZS0zODc4LTQ1ZDctOTVlYi1jMjA5OTk1NTYwZTUiLCJwd2RfZXhwIjoiNTkxNDUxIiw\
icHdkX3VybCI6Imh0dHBzOi8vcG9ydGFsLm1pY3Jvc29mdG9ubGluZS5jb20vQ2hhbmdlUGFzc3dvcmQuYXNweCIsInNjcC\
I6IkRpcmVjdG9yeS5SZWFkLkFsbCBVc2VyLlJlYWQiLCJzdWIiOiI2am9DUkpQQTFQaTdBWXVtZ1ZNMURSZG96ZFpyN0lRZ\
XJkaURoUG9GWXNJIiwidGlkIjoiNmM0NDhkOTAtNGNhMS00Y2FmLWFiNTktMGEyYWE2N2Q3ODAxIiwidW5pcXVlX25hbWUi\
OiJtb2JleGFtaW5lckBkdnNhZ292Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6Im1vYmV4YW1pbmVyQGR2c2Fnb3Yub25taWN\
yb3NvZnQuY29tIiwidXRpIjoieFYyZWFOZUU2MG1HTkpRWUZWSXNBQSIsInZlciI6IjEuMCJ9.dfuRICPaGJJh4WcWdjYP8\
waHrRVFWBuik6dZLTlXrXPnsUWDf7Piq9CrZjR6qEEJoBlKTcw6vgF1WTaUvikLwtl6VTaIMfqbp1niajJOhjxZjWd2p2cm\
Mr7SfbJkD33tHIuG0w71qZBTCacS9PjxrmTv9Qe6QRRsI-kSOwsF-u2L1-kL6iO67LdZa04jxTJVZ3P0IEh1MQBV7FOzCDD\
KiSIwqfAWbFxxh5eUkQfpwARch7wLMnthebO9t-bIS5W2YrL_aJILUhQpz0LO32IDlKMcz63hmCTYvSybCTqTXGd_2unhvE\
fwRdeWktLRZvkP2lIwiv6dKn43gijVg5bQxA';

export const sampleToken_01234567 =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkN0ZlFDOExlLThOc0M3b0MyelFrWnBjcmZPYyIsImtpZCI6Ik\
N0ZlFDOExlLThOc0M3b0MyelFrWnBjcmZPYyJ9.eyJhdWQiOiIwOWZkZDY4Yy00ZjJmLTQ1YzItYmU1NS1kZDk4MTA0ZDRm\
NzQiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82YzQ0OGQ5MC00Y2ExLTRjYWYtYWI1OS0wYTJhYTY3ZDc4MDE\
vIiwiaWF0IjoxNTYwNDM0NDQyLCJuYmYiOjE1NjA0MzQ0NDIsImV4cCI6MTU2MDQzNTk0MiwiYWNyIjoiMSIsImFpbyI6Ij\
QyWmdZT2l0T1pZb2EyZmgrWDhHbTdCeTk5YlFwNmxkclVxc3VySUhuTzhhVEp2MDlBa0EiLCJhbXIiOlsicHdkIl0sImFwc\
GlkIjoiMDlmZGQ2OGMtNGYyZi00NWMyLWJlNTUtZGQ5ODEwNGQ0Zjc0IiwiYXBwaWRhY3IiOiIwIiwiZXh0bi5lbXBsb3ll\
ZUlkIjpbIjAxMjM0NTY3Il0sImlwYWRkciI6IjE4NS4zMS4xNTUuMTU1IiwibmFtZSI6Ik1FU0JldGEgVXNlciAxIiwib2l\
kIjoiOGUwNjQ2ODAtOGFiZS00ZWY5LWFjYmItMjlkNWEzMGFhNmVjIiwic2NwIjoiRGlyZWN0b3J5LlJlYWQuQWxsIFVzZX\
IuUmVhZCIsInN1YiI6InZwSndEVW9MbWlwS0RNMHhMNTc4MGFrNXgza1pZLUM5aWRPdFhtY01RVUkiLCJ0aWQiOiI2YzQ0O\
GQ5MC00Y2ExLTRjYWYtYWI1OS0wYTJhYTY3ZDc4MDEiLCJ1bmlxdWVfbmFtZSI6Im1vYmV4YW1pbmVyMUBkdnNhZ292Lm9u\
bWljcm9zb2Z0LmNvbSIsInVwbiI6Im1vYmV4YW1pbmVyMUBkdnNhZ292Lm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6IkMwT2x\
FblJjODB5bFhVZFlOLWxDQUEiLCJ2ZXIiOiIxLjAifQ.JYF-pIPaPgwx53cSsHRBnW9xqKzcn15aUdSS2_A7U7kyqWegkyo\
ndTCIYl_iwCW4hqdmMD5U8pGXFDYahbCABUsrJPnX1-4L9rFCBvRQzpGKZPJsrPAeLZjPFXLQ_Rk9VOFAZaTXAI426FYp75\
WsvyZCPejXBvjTk8NTUh6NcdXr6oZW1cMVMYVLf1kOjS8QopynWfe1349DnFNvUEMqILlj7Fr5LXD5HZo81sjYWLSyijOzI\
VUQ4QJMUSisGQ9wSBR7GgFuPvKrdIzvi-2dZLcaCazThAsA9XxV1FetdMtFHcX0XiW-FEDfEYZhJoMhj7Gyk0GW9Z4kyDj-\
sKbh_w';

export const noTestResults: TestResultRecord[] = [];

export const testResult: TestResultRecord[] =
  [{
    test_result: {
      category: 'B',
      testData: {
        ETA: {}, eco: {},
        manoeuvres: {},
        drivingFaults: {},
        seriousFaults: {},
        vehicleChecks: {
          showMeQuestion: {},
          tellMeQuestion: {},
        },
        controlledStop: {},
        dangerousFaults: {},
        testRequirements: {},
      },
      journalData: {
        examiner: {
          staffNumber: '01234567',
        },
        candidate: {
          gender: 'F',
          candidateId: 101,
          dateOfBirth: '1977-07-02',
          driverNumber: 'PEARS015220A99HC',
          candidateName: {
            title: 'Miss',
            lastName: 'Pearson',
            firstName: 'Florence',
          },
          mobileTelephone: '07654 123456',
          candidateAddress: {
            postcode: 'PO57 0DE',
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            addressLine3: 'Address Line 3',
            addressLine4: 'Address Line 4',
            addressLine5: 'Address Line 5',
          },
          ethnicOriginCode: 1271,
          primaryTelephone: '01234 567890',
          secondaryTelephone: '04321 098765',
        },
        testCentre: {
          centreId: 54321,
          costCode: 'EXTC1',
        },
        testSlotAttributes: {
          start: '2019-06-24T08:10:00',
          slotId: 1001,
          welshTest: false,
          extendedTest: false,
          specialNeeds: false,
          vehicleSlotType: 'B57mins',
        },
        applicationReference: {
          checkDigit: 1,
          applicationId: 1234567,
          bookingSequence: 3,
        },
      },
      testSummary: {
        D255: true,
        identification: 'Licence',
        weatherConditions: [
          'Icy',
        ],
        candidateDescription: 'Fgh',
        additionalInformation: 'Trh',
      },
      activityCode: '21',
      accompaniment: {},
      vehicleDetails: {
        registrationNumber: '',
      },
      instructorDetails: {},
      preTestDeclarations: {
        preTestSignature: '',
        insuranceDeclarationAccepted: false,
        residencyDeclarationAccepted: false,
      },
      postTestDeclarations: {
        postTestSignature: '',
        healthDeclarationAccepted: false,
        passCertificateNumberReceived: false,
      },
      communicationPreferences: {
        updatedEmail: '',
        communicationMethod: 'Post',
      },
    },
  }];

export const moreThanOneTestResult: TestResultRecord[] = [
  testResult[0],
  testResult[0],
];

export const applicationReference: number = 1234570231;
export const staffNumber = '1234570231';
