interface DecompressionTestCase {
  compressed: string;
  uncompressed?: any; // TODO: Can this be a StandardCarTestCATBSchema once the app's state complies?
}

export const decompressionServiceTestData: { [caseName: string]: DecompressionTestCase } = {
  test1: {
    compressed: `H4sIAJnX9FwAA41WTW/bOBC991cYum4KSHKUOLkpchYtEBdp7MUWKPZAU2OLW4pUqWFiI8h/71CflN1g92KDM284b2Yex379MJsF/2p
    rFJNLhiy4nb2SiYxwYKVQYAYL2Wpku90XW24bcxDF86BxvV20MQg1ZqDQgB/FNVl17mzB/bdNFp0HraXGFNGIraWjH/wCsi42BCHjjskaLgYyFPM5J3M
    UhsmFR9E4bBCH0c3HMPk4jzZRfDtf3IbhH2FEn8GAfYZCcAku+eZYNfzukmuquh4xcEBQOeQ+hQl9zlQucoaTktneHeeL4ZoBlea5gdov0cFb4wP1O3I
    sDrM1MhRa0bcBwIHOFBs77FqXUEnG4R3QvAcxA+wdzGWP4QKPPqai0fFudH/dHQ6zQ5oGnfvtvLhuHMm55wsrYVrzTpgaO3OQSuGnlWx0ZaystiCl70e
    BsnGuzDmb3IhnMKNKs3T1eLcIkzgO08XNp2yc7d5NtsGsmBz7F5R6KyRsQEJVaNUkCq+vkssZCf4yuRqBlRElM8cp0oFmydX14iacCp1VlRS8mesT7MC
    A4lPRjP62kS7bdTRk22r9Q6j9Gn7aLjQeG10A/7EUe+FEetWm/dClJprg5LsELplp7h/1F5DarWF0n+dOOYcKIZ++uYDkInJKffxvaJdyLfaKoW32QRA
    MhOBIN+0LdJAnqK10rJWVsvEyznVZMSVKWiWOaBvUvdYlIBPSK8DAXtTYshmnPiajAtFYjtp4oa3LrZ7p1suZ2oPRtv6TEasR2umK2n/uKJnSYJ8NTKw
    1GPHbe7Ap+qcVBlyBE9/9JvWPwLV/5JpWq5YS8jXqyvd0vcmcCibrE+nlrOCrpZzUHi/EMSz0y4nvVDisrjOahYQe0U9XP4uaTEw+CO7E+OgseSODfo5
    9PBgUO6drGKbjIGMS2jHvy7MAJrH4H4L7Xaon4EDL4AzbZXxHnc0Pki3dy/ZUpu1JARf9+8mhcotE4bJVyNQ/rMAl1NyIqutksGHDTnOrWGDTzs9qp03
    JOpB3zQswLMBkWrVQ16Lv//TShK0RsPtboKKNfjqFZZwkJ5wd27ZTHZtujGMT6AmWVnWIR9PvK28ytnJV5fclvammgYNKvcgVYKFP+JCMc3qPkD/QY7P
    tT2WQHUvDYD8SYBypm3js/znEtE3ffgFvSt1HrwgAAA==`,
    uncompressed: {
      journalData: {
        examiner: {
          staffNumber: '123',
        },
        testCentre: {
          centreId: 1,
          costCode: 'EXTC1',
        },
        testSlotAttributes: {
          welshTest: false,
          slotId: 1005,
          start: '2019-05-31T12:38:00+01:00',
          vehicleSlotType: 'B57mins',
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
        provisionalLicenceProvided: null,
        passCertificateNumber: null,
      },
      postTestDeclarations: {
        healthDeclarationAccepted: false,
        passCertificateNumberReceived: false,
        postTestSignature: '',
      },
      testSummary: {
        routeNumber: null,
        independentDriving: null,
        candidateDescription: 'Tall',
        additionalInformation: null,
        weatherConditions: [],
        debriefWitnessed: null,
        D255: null,
        identification: 'Licence',
      },
      communicationPreferences: {
        updatedEmail: '',
        communicationMethod: null,
        conductedLanguage: 'Cymraeg',
      },
      activityCode: '20',
    },
  },
  nonGzip: {
    compressed: 'xyz',
  },
  gzipNotJson: {
    compressed: 'H4sIAFAl9VwAA0vKScxIAmIADQB9PggAAAA=',
  },
};
