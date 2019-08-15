import * as mysql from 'mysql2';
import { QueryParameters } from '../../domain/query_parameters';

export const getConciseSearchResultsFromSearchQuery = (queryParameters: QueryParameters): string => {
  const parameterArray: string[] = [];
  let queries: string[] = [];

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
    queries.push('tc_cc = ?');
    parameterArray.push(queryParameters.dtcCode);
  }
  if (queryParameters.staffNumber) {
    queries.push('staff_number = ?');
    parameterArray.push(queryParameters.staffNumber);
  }

  if (queryParameters.applicationReference) {
    if (queryParameters.applicationReference.toString().length === 8) {
      /*
        Finds appRefs based on 8 digits provided
        Uses range query to find appRefs between those numbers
        Most performant way of implementing the 8 digit app ref search
      */
      queries.push('application_reference >= ? AND application_reference <= ?');
      parameterArray.push(`${queryParameters.applicationReference.toString()}000`);
      parameterArray.push(`${queryParameters.applicationReference.toString()}999`);
    } else {
      queries.push('application_reference = ?');
      parameterArray.push(queryParameters.applicationReference.toString());
    }
  }

  // Add AND between all statements
  queries = [...queries].map((e, i) => i < queries.length - 1 ? [e, 'AND'] : [e]).reduce((a, b) => a.concat(b));

  // Stringify the array, leaving spaces between
  let queryString = 'SELECT test_result FROM TEST_RESULT WHERE ';

  queries.forEach((query) => {
    queryString = queryString.concat(`${query} `);
  });

  queryString = queryString.concat('ORDER BY test_date DESC LIMIT 200;');

  return mysql.format(queryString, parameterArray);
};
