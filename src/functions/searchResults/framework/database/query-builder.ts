import * as mysql from 'mysql2';
import { QueryParameters } from '../../domain/query_parameters';

export const buildDriverDetailsSearchQuery = (queryParameters : QueryParameters): string => {
  const parameterArray : string[] = [];
  let queries : string[] = [];

  if (queryParameters.startDate && queryParameters.endDate) {
    queries.push('test_date >= ? AND test_date <= ?');
    parameterArray.push(queryParameters.startDate);
    parameterArray.push(queryParameters.endDate);
  }
  if (queryParameters.driverNumber) {
    queries.push('driver_number = ?');
    parameterArray.push(queryParameters.driverNumber);
  }
  if (queryParameters.dtcCode) {
    queries.push('json_extract(test_result, \'$.journalData.testCentre.costCode\') = ?');
    parameterArray.push(queryParameters.dtcCode);
  }
  if (queryParameters.staffNumber) {
    queries.push('staff_number = ?');
    parameterArray.push(queryParameters.staffNumber);
  }
  if (queryParameters.applicationReference) {
    queries.push('application_reference = ?');
    parameterArray.push(queryParameters.applicationReference);
  }

  // Add AND between all statements
  queries = [...queries].map((e, i) => i < queries.length - 1 ? [e, 'AND'] : [e]).reduce((a, b) => a.concat(b));

  // Stringify the array, leaving spaces between
  let queryString = 'SELECT * FROM TEST_RESULT WHERE ';

  queries.forEach((query) => {
    queryString = queryString.concat(`${query} `);
  });

  queryString = queryString.concat('ORDER BY test_date DESC LIMIT 200;');

  return mysql.format(queryString, parameterArray);
};
