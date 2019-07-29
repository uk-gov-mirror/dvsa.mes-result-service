import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { QueryParameters } from '../../domain/query_parameters';
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

export const queryParameter: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '1234570231',
  dtcCode: 'EXTC1',
};

export const testResultResponse = [
  { costCode:'EXTC1',
    testDate:'2019-06-26T09:07:00',
    driverNumber:'DOEXX625220A99HC',
    applicationReference:1234569019,
    category:'B',
    activityCode:'2',
    candidateName:'candidatename',
  },
];

export const testResult : TestResultRecord [] = [{
  test_result: { category: 'B',
    testData:
    { ETA: { physical: true },
      eco: { completed: true },
      manoeuvres: { reverseRight: [Object] },
      drivingFaults: { moveOffSafety: 2, controlsAccelerator: 1 },
      seriousFaults: { controlsAccelerator: true },
      vehicleChecks: { showMeQuestion: [Object], tellMeQuestion: [Object] },
      controlledStop: { fault: 'DF', selected: true },
      eyesightTest: { complete: true, seriousFault: false },
      dangerousFaults: { useOfSpeed: true },
      testRequirements:
      { hillStart: true,
        angledStart: true,
        normalStart1: true,
        normalStart2: true } },
    journalData:
    { examiner: { staffNumber: '01234567', individualId: 9000001 },
      candidate:
      { gender: 'F',
        candidateId: 103,
        dateOfBirth: '1989-05-13',
        driverNumber: 'DOEXX625220A99HC',
        emailAddress: 'jane.doe@example.com',
        candidateName: 'candidatename',
        mobileTelephone: '07654 123456',
        candidateAddress: [Object],
        ethnicOriginCode: 1272 },
      testCentre: { centreId: 54321, costCode: 'EXTC1' },
      testSlotAttributes:
      { start: '2019-06-26T09:07:00',
        slotId: 1003,
        welshTest: false,
        extendedTest: false,
        specialNeeds: true,
        vehicleSlotType: 'B57mins',
        examinerVisiting: false },
      applicationReference: { checkDigit: 9, applicationId: 1234569, bookingSequence: 1 } },
    testSummary:
    { D255: true,
      identification: 'Licence',
      debriefWitnessed: true,
      weatherConditions: ['Bright / wet roads', 'Showers'],
      independentDriving: 'Sat nav' },
    activityCode: '2',
    accompaniment: {},
    vehicleDetails: { gearboxCategory: 'Manual', registrationNumber: 'ABC' },
    instructorDetails: {},
    preTestDeclarations:
    { preTestSignature: 'data:image/svg+xml;base64,hY2siPjwvY2lyY2xlPjwvc3ZnPg==',
      insuranceDeclarationAccepted: true,
      residencyDeclarationAccepted: true },
    postTestDeclarations:
    { postTestSignature: '',
      healthDeclarationAccepted: false,
      passCertificateNumberReceived: false },
    communicationPreferences:
    { updatedEmail: 'jane.doe@example.com',
      communicationMethod: 'Email' } },
}];
