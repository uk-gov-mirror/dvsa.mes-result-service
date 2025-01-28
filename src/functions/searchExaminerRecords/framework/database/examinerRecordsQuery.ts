export const examinerRecordsQuery = `SELECT
    application_reference AS 'appRef',
    category AS 'testCategory',
    JSON_OBJECT(
        'centreId', tc_id,
        'costCode', tc_cc,
        'centreName', JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.journalData.testCentre.centreName'))
    ) AS testCentre,
    test_date AS 'startDate',
    CAST(JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testSummary.routeNumber')) as SIGNED) AS 'routeNumber',
    JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testData.controlledStop.selected')) AS 'controlledStop',
    JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.journalData.testSlotAttributes.extendedTest')) AS 'extendedTest',
    JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testSummary.independentDriving')) AS 'independentDriving',
    JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testSummary.circuit')) AS 'circuit',
    JSON_EXTRACT(test_result, '$.testData.safetyAndBalanceQuestions.safetyQuestions') AS 'safetyQuestions',
    JSON_EXTRACT(test_result, '$.testData.safetyAndBalanceQuestions.balanceQuestions') AS 'balanceQuestions',
    CASE
        WHEN JSON_CONTAINS_PATH(test_result, 'one', '$.testData.manoeuvres') THEN
            CASE
                WHEN JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testData.manoeuvres')) = '{}' THEN NULL
                ELSE
                    IF(JSON_TYPE(JSON_EXTRACT(test_result, '$.testData.manoeuvres')) = 'ARRAY',
                       JSON_EXTRACT(test_result, '$.testData.manoeuvres'),
                       JSON_ARRAY(JSON_EXTRACT(test_result, '$.testData.manoeuvres')))
            END
    END AS manoeuvres,
    CASE
        WHEN JSON_CONTAINS_PATH(test_result, 'one', '$.testData.vehicleChecks.showMeQuestion') THEN
            CASE
                WHEN JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testData.vehicleChecks.showMeQuestion')) = '{}' THEN NULL
                ELSE JSON_ARRAY(JSON_EXTRACT(test_result, '$.testData.vehicleChecks.showMeQuestion'))
            END
        WHEN JSON_CONTAINS_PATH(test_result, 'one', '$.testData.vehicleChecks.showMeQuestions')
        THEN JSON_EXTRACT(test_result, '$.testData.vehicleChecks.showMeQuestions')
    END AS showMeQuestions,
    CASE
        WHEN JSON_CONTAINS_PATH(test_result, 'one', '$.testData.vehicleChecks.tellMeQuestion') THEN
            CASE
                WHEN JSON_UNQUOTE(JSON_EXTRACT(test_result, '$.testData.vehicleChecks.tellMeQuestion')) = '{}' THEN NULL
                ELSE JSON_ARRAY(JSON_EXTRACT(test_result, '$.testData.vehicleChecks.tellMeQuestion'))
            END
        WHEN JSON_CONTAINS_PATH(test_result, 'one', '$.testData.vehicleChecks.tellMeQuestions')
        THEN JSON_EXTRACT(test_result, '$.testData.vehicleChecks.tellMeQuestions')
    END AS tellMeQuestions
FROM TEST_RESULT WHERE test_date >= ? AND test_date <= ? AND staff_number = ? 
ORDER BY test_date DESC;
`;
