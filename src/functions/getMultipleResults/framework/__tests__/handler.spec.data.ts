import { TestResultRecord } from '../../../../common/domain/test-results';
import { FullResultQueryParameters } from '../../domain/query_parameters';

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
    autosave: 0,
  }];

// eslint-disable-next-line
export const encodedTestResult = 'H4sIAAAAAAAAE31UTY/jNgz9KwHPHsB24njiWybJoAPsfHSSQ4HFotDIjM2uLHklOrvBIP+9kOykcdD2ZvE98pHik79+AqPjPy26TjEUnyAFY2XsEQp4gCiga8HCQ5vdEorPUwQoTf/RCG2wO1h0/bm0dCBdPYpO8RByaMl07jp0wJqkwlWN8rsPgavNz2f8vUPHZHRPYlRqHDtFII1ma5TCcsumHTSFrtDeSPi23/FHRxYb1H30FMFfprNaqPNA+Es0pNGGHljs9y9d8+GPECfpdJbNc/CiQpdUCkZPq1CXgfEIV8hTCUUSJ74Zxtf9A1muoYBkked3cX4Xp9DfDdqLwttm+b6NkyxN4+Vi8dvqutyLaIIYEyuEAp7JOYhACcc9BG8orDMaItiTvUQflbGoJfquG/NBCneosK2N9micz7PZpB/sWm1ZlhZdWERrHEtTBoXXLJ/E6w1EIHrCF9KYQAEDf+LPk2SMp7d4Osant/h0jM9u8dkYz27xzM+KXGuSr5Yq0qvQfpLmSQStpUbY4+gS/PyTbJ7fL2Lw7pRGl7ec2TRNJvHiPp+H8t5MK9Rsw1Jk+PIbzzzPm9JxrwqbP3ar5JyyVYaXzJY+OkY3eMwyFJDGyeIunt+ls118XyRxEYdelOHeSN5JP1G5eoeOodgL5TAC/MXefOUo6FqUJNQLYukuweGB+QZ2x9Y39pDlDWnnWxNtq0gK/6recY+9Yfxc/jmuqSKGIhnRQlP9e4jgw5jvpKst/uj6zOnpPG/X+Nv2tdZplkHBtsMIqETNtB9qQQFfSIZMP6PgGu3K6JI86KD4Ck/yCN+u7LlGJy21Q/JjVfeOCAlCPem9sc259M7WYUTJdCA+DltJg0mlNE0rNPn/weg/tEYWpMKCLFbk2IZyl5fqK5J2bDvJxv7DPnmDod/GGqUSfVb/jPrwliotuPO2AQg1Oiu0xCv6UkpsGcvL6iw6f2Hy+N8kr2sc/6vwEL9RrlEorv9PthXOrdAOe8J+9neUSIdrXWmaptPDKt/s2T5Bu2v9tspNI0j1siP2M3JtSv9jMY7Be0Z0bJw4IBTx6dvfJYPKaYkGAAA=';

export const applicationReferences: string[] = ['1234570231', '1234570232'];
export const staffNumber: string = '1234570231';

export const queryParameter: FullResultQueryParameters = {
  staffNumber: '00123456',
  applicationReferences: ['1234570231', '1234570232'],
};
