import * as mysql from 'mysql2';
import {Mock, It, IMock} from 'typemoq';
import * as queryBuilder from '../../database/query-builder';
import * as database from '../../../../../common/framework/mysql/database';
import {Connection as PromiseConnection} from 'mysql2/promise';
import {FieldPacket, RowDataPacket} from 'mysql2';
import { multipleTestResultsQuery } from '../../database/query-builder';

describe('GetResultRepository', () => {
  describe('getMultipleResult', () => {
    let mockMysqlConnection: IMock<mysql.Connection>;
    let mockQueryFunction: IMock<(sql: string, values?: any) => Promise<[mysql.RowDataPacket[], mysql.FieldPacket[]]>>;
    let mockEndFunction: IMock<() => void>;

    beforeEach(() => {
      mockQueryFunction = Mock.ofInstance((sql: string, values?: any) => new Promise(() => {}));
      mockEndFunction = Mock.ofInstance( () => {});
      mockMysqlConnection = Mock.ofType<mysql.Connection>();

      mockMysqlConnection
        .setup(x => x.promise())
        .returns(() => ({ query: mockQueryFunction.object }) as PromiseConnection);

      mockMysqlConnection
        .setup(x => x.end())
        .returns(() => {});

      spyOn(database, 'getConnection').and.returnValue(mockMysqlConnection.object);
      spyOn(queryBuilder, 'multipleTestResultsQuery').and.returnValue('data');
    });

    it('should return data on successful execution', async () => {
      const staffNumber = '123456';
      const appRefs = ['123', '234', '345'];
      const expectedData = [];

      mockQueryFunction
        .setup(x => x(It.isAnyString(), It.isAny()))
        .returns(async () => [expectedData, []] as [RowDataPacket[], FieldPacket[]]);

      mockEndFunction
        .setup(x => x())
        .returns(() => {});

      const result = await multipleTestResultsQuery(staffNumber, appRefs);

      expect(result).toEqual('data');
    });
  });
});
