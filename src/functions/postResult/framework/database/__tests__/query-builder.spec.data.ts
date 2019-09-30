import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';

export const dummyTestResult: StandardCarTestCATBSchema = {
  version: '0.0.1',
  category: 'B',
  journalData: {
    examiner: {
      staffNumber: '999',
    },
    testCentre: {
      centreId: 54321,
      costCode: 'EXTC1',
    },
    testSlotAttributes: {
      welshTest: false,
      slotId: 1005,
      start: '2019-06-05T12:38:00+01:00',
      vehicleTypeCode: 'C',
      extendedTest: false,
      specialNeeds: false,
    },
    candidate: {
      candidateAddress: {
        addressLine1: 'x Station Street',
        addressLine2: 'Someplace',
        addressLine3: 'Somearea',
        addressLine4: 'Somecity',
        postcode: 'UBxx xAA',
      },
      candidateId: 105,
      candidateName: {
        firstName: 'Ali',
        lastName: 'Campbell',
        title: 'Mr',
      },
      driverNumber: 'CAMPB805220A89HC',
      mobileTelephone: '07654 123456',
      primaryTelephone: '01234 567890',
    },
    applicationReference: {
      applicationId: 1234571,
      bookingSequence: 2,
      checkDigit: 6,
    },
  },
  preTestDeclarations: {
    insuranceDeclarationAccepted: false,
    residencyDeclarationAccepted: false,
    preTestSignature: '',
  },
  accompaniment: {},
  vehicleDetails: {
    registrationNumber: '',
  },
  instructorDetails: {},
  testData: {
    dangerousFaults: {},
    drivingFaults: {},
    manoeuvres: {},
    seriousFaults: {},
    testRequirements: {},
    ETA: {},
    eco: {},
    controlledStop: {},
    eyesightTest: {},
    vehicleChecks: {
      tellMeQuestion: {},
      showMeQuestion: {},
    },
  },
  passCompletion: {
    provisionalLicenceProvided: true,
    passCertificateNumber: 'abc123',
  },
  postTestDeclarations: {
    healthDeclarationAccepted: false,
    passCertificateNumberReceived: false,
    postTestSignature: '',
  },
  testSummary: {
    weatherConditions: [],
    identification: 'Licence',
  },
  communicationPreferences: {
    communicationMethod: 'Email',
    conductedLanguage: 'English',
    updatedEmail: '',
  },
  activityCode: '51',
  rekey: false,
  changeMarker: false,
  examinerBooked: 12345678,
  examinerConducted: 12345678,
  examinerKeyed: 12345678,
};
